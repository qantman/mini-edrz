#include <EEPROM.h>
#include <CN0349.h>
#include <TroykaI2CHub.h>

const int size = 8;
uint8_t adrHub = 0x70;
TroykaI2CHub splitter(adrHub);

CN0349 CT[size];

// State = "L";
float arrGF_low[size];
float arrNOS_low[size];
//
// State = "H";
float arrGF_high[size];
float arrNOS_high[size];
//
float arrStateCalib[size]; // 0 - "L", 1 - "H";
//find, and save gain factors, and offsets. See AD5934 and CN-0349 datasheets for process
void calibrateCN0349(char state, int channel) {
  splitter.setBusChannel(channel);

  /*
  CN-0349 reference:
  Rcal(ohms) | Rfb(ohms)  |MUXChannels
  //RTD:   R3(100)     R9(100)      4,1
  //High1: R3(100)     R9(100)      4,1
  //High2: R4(1000)    R9(100)      5,1
  //Low1:  R4(1000)    R8(1000)     5,2
  Low2:  R7(10000)   R8(1000)     6,2
  */

  float H1Tmag, H2mag, L1mag, L2mag = 0;
  float YL, YH, NH, NL, GF_low, NOS_low, GF_high, NOS_high = 0;
  //reference:                      //three point calibration
  //Rcal = {R3,R4,R7} = {100,1000,10000}

  if (state == 'L') {  //LOW MODE
    //Low range 1 //was 1000 1000
    L1mag =  CT[channel].calibrate(R4, R4);    
    //Low range 2
    L2mag =  CT[channel].calibrate(R7, R4);

    YL = 1 / R7;  //low admittance
    YH = 1 / R4;  //high admittance
    NL = L2mag; //Magnitudes
    NH = L1mag;
    GF_low = (YH - YL) / (NH - NL); //interpolation
    NOS_low = NH - (YH) / GF_low; //calculate offset

    // Save values
    arrGF_low[channel] = GF_low; 
    arrNOS_low[channel] = NOS_low;
    arrStateCalib[channel] = 0;
  }else if(state == 'H') {//HIGH MODE
    H1Tmag = CT[channel].calibrate(R3, R9);     //High range 1
    H2mag = CT[channel].calibrate(R4, R9);     //High range 2
    YL = 1 / R4;   //low admittance
    YH = 1 / R3;     //high admittance
    NL = H2mag;    //Magnitudes
    NH = H1Tmag;
    GF_high = (YH - YL) / (NH - NL);   //interpolation
    NOS_high = NH - YH / GF_high;      //calculate offset

    arrGF_high[channel] = GF_high;  //save values in memory
    arrNOS_high[channel] = NOS_high;
    arrStateCalib[channel] = 1;
  }else {
    Serial.println("Please enter H or L");
  }
}

void setup(){
  Serial.begin(115200);
  Serial.println("Calibration in progress");
  for(int i = 0; i < 8; i++){
    splitter.setBusChannel(i);
    CT[i].configureAD5934(15, 8 * pow(10, 3), 4, 2); 
    delay(5);
    calibrateCN0349('H', i);
  }
  Serial.println("Calibration done");
}
void loop(){
  float YL, YH, NH, NL, GF_low, NOS_low, GF_high, NOS_high = 0;
  float Y_cell, T_cell, YT_cell, T_imp, imp = -1;
  Serial.print(adrHub); Serial.print(";");
  for(int i = 0; i < 8; i++){
    splitter.setBusChannel(i);
    GF_high = arrGF_high[i];  
    NOS_high = arrNOS_high[i];
    uint8_t CT_error = CT[i].measure(GF_high, GF_high, NOS_high, 'H', &T_imp, &imp, &Y_cell, &T_cell);
    if(i == 7){
      Serial.print(Y_cell, 4); Serial.println(";");
    }else{
      Serial.print(Y_cell, 4); Serial.print(";");
    }
  }
}

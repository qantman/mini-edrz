#include <TroykaI2CHub.h>
#include <Adafruit_MCP4725.h>
const int size = 8;
uint8_t adr_hub[size] = {0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77}; //adress hub
uint8_t adr_pca[4] = {0x60, 0x61, 0x62, 0x63}; //adress PCA4725
TroykaI2CHub hub1(adr_hub[0]);
Adafruit_MCP4725 dac1[size];
bool status1[size]; //connect or not connect
float Vdac[size]; //output voltage of DAC
int memoryFree(){
  extern int *__brkval;
  int freeValue; 
    if((int)__brkval == 0) {
      freeValue = ((int)&freeValue) - ((int)__malloc_heap_start);
    }else {
      freeValue = ((int)&freeValue) - ((int)__brkval);
    }
  return freeValue;
}
void start_pca(TroykaI2CHub hub, Adafruit_MCP4725* dac, bool* status)
{
  hub.begin();
  for(int i = 0; i < 8; i++)
  {
    hub.setBusChannel(i);
    //delay(10);
    if(i == 0)
    {
      if(dac[i].begin(adr_pca[1]))
      {
      status[i] = true;
      }
      else
      {
        status[i] = false;
      }
    }
    else
    {
      if(dac[i].begin(adr_pca[0]))
      {
        status[i] = true;
      }
      else
      {
        status[i] = false;
      }
    }
  }
}

void write_value(TroykaI2CHub hub, Adafruit_MCP4725* dac, bool* status, float* value)
{
  float ref_volt = 5.0; //reference voltage (V)
  uint16_t analog_value[size]; //voltage coefficient
  for(int i = 0; i < 8; i++)
  {
    if(status[i] == 0)
    {
      continue;
    }
    else
    {
      hub.setBusChannel(i);
      if(value[i] < ref_volt)
      {
        analog_value[i] = (4096 * value[i])/(ref_volt);
        dac[i].setVoltage(analog_value[i], false);
      }
      else if(value[i] > ref_volt)
      {
        dac[i].setVoltage(4095, false);
      }
      else if(value[i] == ref_volt)
      {
        dac[i].setVoltage(4095, false);
      }
    }
  }
}
void parse(String data, uint8_t len_data)
{
  for(int i = 0; i < 8; i++)
  {
    Vdac[i] = data.substring((((7)*(i+1))-1), (10+7*i)).toFloat();
  }
}
void setup()
{
  float start_voltage = 0.0; //starting voltage on DAC (0.0 V)
  float start_value[size] = {start_voltage, start_voltage, start_voltage, start_voltage, start_voltage, start_voltage, start_voltage, start_voltage};
  Serial.begin(9600);
  Serial.setTimeout(5);
  start_pca(hub1, dac1, status1);
  write_value(hub1, dac1, status1, start_value);
  //112;0:0.00;1:1.00;2:2.00;3:3.00;4:4.00;5:5.00;6:6.00;7:7.00 - test str
}
void loop()
{
  if(Serial.available() > 0)
  {
    String data = Serial.readString();
    uint8_t len  = data.length();
    parse(data, len);
    write_value(hub1, dac1, status1, Vdac);
  }
  else
  {
    for(int i = 0; i < 8; i++) 
    {
      if(i == 7)
      {
        Serial.print(i); Serial.print(":"); Serial.println(status1[i]);
      }
      else
      {
        Serial.print(i); Serial.print(":"); Serial.print(status1[i]); Serial.print(";");
      }
    }
    delay(200);
  }
}

#include <Adafruit_ADS1X15.h>
#include <TroykaI2CHub.h>
const int size = 8;
uint8_t adr_hub[size] = {0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77};
uint8_t adr_ads[4] = {0x48, 0x49, 0x4A, 0x4B};
//Количество массивов для ads == колличеству мультиплексоров
TroykaI2CHub hub1(adr_hub[0]);
Adafruit_ADS1X15 ads1[size];
bool status1[size];
float multiplier = 0.1875F;
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
void start_ads(TroykaI2CHub hub, Adafruit_ADS1X15* ads, bool* status)
{
  hub.begin();
  for(int i = 0; i < 8; i++)
  {
    hub.setBusChannel(i);
    //delay(10);
    if(ads[i].begin(0x48))
    {
      status[i] = true;
    }
    else
    {
      status[i] = false;
    }
  }
}
void read_value(TroykaI2CHub hub, Adafruit_ADS1X15* ads, bool* status, uint8_t adr)
{
  int16_t results;
  float value;
  Serial.print(adr); Serial.print(";");
  for(int i = 0; i < 8; i++)
  {
    hub.setBusChannel(i);
    //delay(10);
    if(status[i] == 1)
    {
      if(i == 7)
      {
        results = ads[7].readADC_Differential_0_1();
        value = ((results * multiplier)/1000);
        Serial.print(value); Serial.println(";");
      }
      else
      {
        results = ads[i].readADC_Differential_0_1();
        value = ((results * multiplier)/1000);
        Serial.print(value); Serial.print(";");
      }
    }
    else
    {
      if(i ==7)
      {
        Serial.print("nc"); Serial.println(";");
      }
      else
      {
        Serial.print("nc"); Serial.print(";");
      }
    }
  }
}
void setup()
{
  Serial.begin(115200);
  for(int i = 0; i < 8; i++)
  {
    hub1.setBusChannel(i); 
    ads1[i].setGain(GAIN_TWOTHIRDS);
    //delay(30);
    //delay(30);
  }
  start_ads(hub1, ads1, status1);
}
void loop()
{
  read_value(hub1, ads1, status1, adr_hub[0]);
}
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

//SETUP SSID CONFIG
const char* ssid = "esp";
const char* password = "123456789";
const char* backend_url = "192.168.56.92";
const int port = 5500;
const char* light_endpoint = "/esp/light/status";
const int lampuPins[3] = { D0, D1, D2 };
unsigned long lastRequestTime = 0;
const int requestInterval = 2000;      // 2 detik
bool pinModeDeclared[17] = { false };  // Untuk NodeMCU (GPIO 0-16)

struct Lampu {
  const char* name;
  int pin;
};

Lampu lampuConfig[9] = {
  { "D0", D0 },
  { "D1", D1 },
  { "D2", D2 },
  { "D3", D3 },
  { "D4", D4 },
  { "D5", D5 },
  { "D6", D6 },
  { "D7", D7 },
  { "D8", D8 },
};
const int jumlahLampu = sizeof(lampuConfig) / sizeof(lampuConfig[0]);

void setupWIFI() {
  delay(10);
  Serial.println('\n');

  WiFi.begin(ssid, password);
  Serial.print("Connecting to ");
  Serial.print(ssid);
  Serial.println(" ...");

  int i = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(++i);
    Serial.print(' ');
  }

  Serial.println('\n');
  Serial.println("Connection established!");
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());
}
void safePinMode(int pin, int mode) {
  if (!pinModeDeclared[pin]) {
    pinMode(pin, mode);
    pinModeDeclared[pin] = true;
    Serial.print("Pin D");
    Serial.print(pin);
    Serial.println(" diinisialisasi");
  } else {
    Serial.print("Pin D");
    Serial.print(pin);
    Serial.println(" sudah diinisialisasi sebelumnya");
  }
}
void setup() {
  Serial.begin(115200);
  for (int i = 0; i < jumlahLampu; i++) {
    safePinMode(lampuConfig[i].pin, OUTPUT);
    digitalWrite(lampuConfig[i].pin, LOW);
  }
  setupWIFI();
}
int parsePinName(const char* name) {
  for (int i = 0; i < jumlahLampu; i++) {
    if (strcmp(lampuConfig[i].name, name) == 0) {
      return lampuConfig[i].pin;
    }
  }
  return -1;
}
void loop() {
  if (millis() - lastRequestTime >= requestInterval) {
    lastRequestTime = millis();

    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      Serial.println("Menghubungkan ke server...");
      if (http.begin(client, backend_url, port, light_endpoint)) {
        int httpCode = http.GET();
        if (httpCode == HTTP_CODE_OK) {
          String payload = http.getString();
          DynamicJsonDocument doc(256);
          DeserializationError error = deserializeJson(doc, payload);
          if (!error) {
            for (JsonObject item : doc.as<JsonArray>()) {
              const char* lightId = item["id"];
              const char* status = item["status"];
              const char* light_status = item["light_status"];
              const char* pin = item["light_pin"];
              int pinNumber = parsePinName(pin);
              safePinMode(pinNumber, OUTPUT);
              if (strcmp(light_status, "ON") == 0) {
                digitalWrite(pinNumber, HIGH);
              } else {
                digitalWrite(pinNumber, LOW);
              }
            }
          } else {
            Serial.print("Error Saat Parsing JSON");
          }

        } else {
          Serial.print("Error kode HTTP: ");
          Serial.println(httpCode);
        }
      } else {
        Serial.println("Gagal terkoneksi ke server!");
      }
    } else {
      Serial.println("WiFi terputus! Mencoba menghubungkan kembali...");
      WiFi.reconnect();
    }
  }
}

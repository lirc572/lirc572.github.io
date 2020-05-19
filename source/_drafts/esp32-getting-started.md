---
title: esp32-getting-started
tags:
- ESP32
- Espressif
- esp-idf
- CLion
- IDE
- tutorial
categories:
- Tutorials
- ESP32
---

## Intorduction

> Setting up a development environment for ESP32 (using Espressif SDK) with CLion.
> - Download and build esp-idf
> - Install CLion
> - Install *ESP32* plugin
> - Configure ESP32 plugin
> - Start a simple project (hello world) and upload to ESP32

The [ESP32](https://en.wikipedia.org/wiki/ESP32) is an inexpensive MCU with Wifi and Bluetooth functionalities. It is developed by Espressif, the company which has also created the [ESP8266](https://en.wikipedia.org/wiki/ESP8266).

Compared to ESP8266, ESP32 has more GPIOs, more PWM channels, a 12-bit ADC instead of 10-bit, CAN bus, Bluetooth capability and a lot more. The good news is, even with so many added features, the ESP32 still costs below $10!

There are many different ways to program an ESP32. The easiest way is probably through [MicroPython](http://docs.micropython.org/en/latest/esp32/quickref.html). You only need to upload the MicroPython firmware to the MCU and then a Python shell is exposed on the UART0 port. From there on, it would be pretty straight forward to use. One problem of developing in MicroPython is that sometimes the hardware would run into problems and it can be hard to debug since many low-level functionalities are not exposed to the user by the MicroPython firmware. Another option would be to [use the Arduino IDE](https://github.com/espressif/arduino-esp32). But here, we would be programming the ESP32 using the native Espressif SDK ([ESP-IDF](https://docs.espressif.com/projects/esp-idf/en/latest/index.html)) because it provides the latest updates from Espressif and we can have full control of the MCU.

## Environment Setup

Here we will set up the development environment in Ubuntu Linux. If you are using Windows10, you can use the same setup under [WSL](https://docs.microsoft.com/en-us/windows/wsl/wsl2-install "Windows Subsystem for Linux")

First, install the following packages:

```bash
sudo apt-get install git wget flex bison gperf python python-pip python-setuptools python-serial python-click python-cryptography python-future python-pyparsing python-pyelftools cmake ninja-build ccache libffi-dev libssl-dev
```

Here, we are going to put all the necessary files under `~/esp`, but you are free to put it anywhere you like.

Run the following commands to create directory and clone the ESP-IDF files.

```bash
mkdir ~/esp
cd ~/esp
git clone --recursive https://github.com/espressif/esp-idf.git  #This takes very long...
```

Install ESP-IDF (this will install the tools under ~/.espressif directory by default, to install to a different directory, set the environment variable `IDE_TOOLS_PATH` before running the script):

```bash
cd ~/esp/esp-idf
./install        #This also takes forever...
```

Now the tools have been downloaded. To use the tools in command line, you need to set the environment variable `IDF_PATH` to `~/esp/esp-idf` and run `. ~/esp/esp-idf/export.sh` (do this every time you open a new terminal window)

> below unfinished...

```bash
sudo adduser YOUR_USERNAME dialout
```

In Linux, `ls /dev/* | grep ttyUSB`

In windows, Check Device Manager for port number (e.g. COM3)
In WSL, COMn is mapped to /dev/ttySn (e.g. COM3 becoms /dev/ttyS3)

```bash
screen /dev/ttyS3 115200
```

```
idf.py menuconfig
idf.py build
idf.py -p /dev/ttyS3 -b 115200 flash #may have problems like incorrect exptool settings
```
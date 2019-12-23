---
title: Sipeed Tang Nano Development Environment Setup
date: 2019-12-23 21:18:19
tags:
---


## Introduction

The Sipeed Tang Nano (sometimes also refered to as Lichee Tang Nano) is a cheap but powerful FPGA development0 board that features the GW1N-LV1QN48C6/I5 chip from [Gowin](https://www.gowinsemi.com/). It costs as little as [USD4.90](https://www.seeedstudio.com/Sipeed-Tang-Nano-FPGA-board-powered-by-GW1N-1-FPGA-p-4304.html) or [CNY34.90](https://m.tb.cn/h.eCSPsYf?sm=9c7938). The Gowin GW1N chip has 1152 LUT4, 864 FF, 72Kbit B-SRAM, 96Kbit user flash and 1 PLL. The board also has an onboard 24MHz crystal. The board has 64Mbit QSPI PSRAM, 36 I/O Pins, 1 RGB LED, 2 push buttons and a 40-pin LCD interface with on-board backlight driver circuit. It has a built-in JTAG downloader so you can download to the chip by simply connecting the computer to it through a USB-Type-C cable.

![Tang Nano Board](/img/tang-nano-setup/tang_nano_board.jpg)

In this article, we will go through the basic steps of how to set up a development environment for the Tang Nano.

## Download and Install the official Gowin IDE

For now, we need the official Gowin IDE to work with the Tang Nano board. Download the IDE from [here](http://www.gowinsemi.com.cn/faq.aspx). Find the links shown in the figure below and download the latest version for your operating system (Windows or Linux).

![gowin download page](/img/tang-nano-setup/gowin_download_page.png)

To install the IDE, Windows users need to unzip and run the installer and follow the step-by-step instructions. Install the driver if not already installed.

For Linux (I have only tested it on Ubuntu, but other common Linux distros should also work) users, just extract the files to any location.

## Configure License

Open the IDE. Windows users can select it from the Start Menu and linux users can run the `gw_ide` executable file under the `.../IDE/bin/` directory (make sure you have execute permission).

Upon starting, the software would prompt for license configuration. You can either use a local license or a license server. A local license allows you to use the software when you are offline. For now, just use Sipeed's license server to set it up. If you want to get a local license file, use the link at the bottom of the window or follow the instructions on [this page](http://tangnano.sipeed.com/en/get_started/install-the-ide.html#license).

Fill in the following information:

![licnese configuration](/img/tang-nano-setup/license_config.png)

Press the `Test Connection` button and you should see a "*Successed*" (sic) message.

If you want to use the Synplify Pro synthesizer in the IDE, you also need to add an environment variable: `LM_LICENSE_FILE=27020@45.33.107.56`.

On Windows, run the following command in cmd:

```cmd
setx LM_LICENSE_FILE 27020@45.33.107.56
```

On Linux, append the following line to your `~/.bashrc` or `~/.profile`, etc.

```bash
export LM_LICENSE_FILE=27020@45.33.107.56
```

After entering the IDE, click on `Synplify Pro` under Tools. The synthesizer should be opened in a few seconds. If the license verification fails, try a re-login or reboot.

## Try a Simple Design

Let's start with a basic design. Since the board has 2 push buttons and an LED, why notuse the push buttons to light up the LED?

Let's take a look at the schematic of the board ([link here](http://dl.sipeed.com/TANG/Nano/HDK)).

![LED](/img/tang-nano-setup/led_schematic.png)
![Push buttons](/img/tang-nano-setup/push_buttons_schematic.png)
![FPGA pins](/img/tang-nano-setup/fpga_pins.png)

From the schematic, we can see that The cathode (negative side) of the R/G/B LED are connected to pins `18`, `16` and `17` respectively. When you pull those pins low, the LED would light up. The two push buttons are connected to pins `14` and `15` which are normally pulled up. When a button is pressed, the corresponding pin would be pulled low. With these information, we can get started.

First, open the IDE.

![IDE start page](/img/tang-nano-setup/ide_start_page.png)

On the start page, create a new project by clicking on `New Project...` under Quick Start or `File` -> `New`.

![New project](/img/tang-nano-setup/new_project.png)

Choose `FPGA Design Project`.

![Project Wizard 1](/img/tang-nano-setup/project_wizard1.png)

We'll name it 'my_project'. Choose a suitable directory to create your project in.

![Project Wizard 2](/img/tang-nano-setup/project_wizard2.png)

Select `GW1N-LV1QN48C6/I5` from the list. It may be quicker to use the filters.

![Project Wizard 3](/img/tang-nano-setup/project_wizard3.png)

Finally, make sure all information on the summary page is correct and click on `Finish`. You will then be directed to a design summary page of your newly created project.

![Design Summary](/img/tang-nano-setup/project_page.png)

Within Design panel, right click and select `New File...`

![New file](/img/tang-nano-setup/new_file.png)

Choose `Verilog File` and click on `OK`.

![Verilog file](/img/tang-nano-setup/verilog_file.png)

Give it a random name and click on `OK` again.

![Editor](/img/tang-nano-setup/editor.png)

Now we are in the editor view.

Copy and paste the following code into the editor.

```verilog
module main (
    input buttonA, buttonB,
    output led
);

nand (led, a, b);
not (a, buttonA);
not (b, buttonB);
endmodule;
```

The above code defines a module called main with 2 input ports and one output port. It can be illustrated as the figure below.

![Logic Gates](/img/tang-nano-setup/logic_gates.png)

Note that only when both push buttons are pressed, their outputs will be pulled low and thus the inputs to the nand gate will be high after passing the inverters. The output of the nand gate (the cathode of the LED) will therefore be low, thus lighting up the LED.

Save the verilog file and go to Process panel.

![Process](/img/tang-nano-setup/process.png)

Right click on `Synthesize -> Configuration`.

You can use either the Synplify Pro or the GowinSynthesis as synthesizer. If you do not have a license for Synplify Pro, you should select GowinSynthesis. Leave everything else as default for now.

![Synthesis configuration](/img/tang-nano-setup/synthesis_configuration.png)

Double click on `Synthesize` or right click and select `Run` or `Rerun` to run the synthesizer. After a few seconds, the icon next to `Synthesize` should become a tick, indicating that the process has completed. Note that if you chose Synplify Pro in the last step, it may take longer.

Next, double click on `FloorPlanner` under `User Constraints`.

![Default constraint file](/img/tang-nano-setup/constraint_file.png)

In the popup window, click on `OK` to create a default CST file.

FloorPlanner is a GUI to create physical constraints or map the physical I/O Pins of the FPGA chip to ports in HDL files.

In the FloorPlanner Window, go to Package View. In NetList Panel, find `buttonA`, `buttonB`, `led` under Ports and drag them to the respective Pins on the right based on the schematic we saw just now. We will be using the Green LED. When it is done, the constraints will be shown at the bottom. (buttonA -> 15, buttonB -> 14, led -> 16)

![FloorPlanner](/img/tang-nano-setup/floorplanner.png)

Click on the save button and close FloorPlanner window. You should now see a new .cst file created by FloorPlanner. You can also create the .cst file yourself instead of using FloorPlanner later on.

![.cst file](/img/tang-nano-setup/cst_file.png)

Next, go back to Process panel and double click on `Place & Route`.

![Place and Route](/img/tang-nano-setup/place_and_route.png)

Now it is time to program the chip. We need to use the built-in programmer.

To open the programmer on Windows, either click on `Program Device` in Process panel or click on the programmer icon in the toolbar at the top.

![Open programmer](/img/tang-nano-setup/open_programmer.png)

On Linux, you need to run the programmer as root. Thus if you did not start the IDE as root (and you should not do so), you cannot start the programmer from the IDE. Run the following script in your terminal and enter your password.

```bash
sudo [Installation-Path]/Programmer/bin/programmer
```

![Programmer](/img/tang-nano-setup/programmer.png)

Now, connect the Tang Nano board to your computer through a USB-Type-C cable and click `Scan Device` in the toolbar. You should then be able to see your board listed below.

![Scan Device](/img/tang-nano-setup/scan_device.png)

Go to `Device Configuration` and select `SRAM Mode` -> `SRAM Program and Verify` under Device Operation. This will upload the code to the SRAM. It is faster than uploading to flash but the design will not be saved if the board loses power. If you want to save the design, choose embedded flash instead. Under Programming Options, find the .fs file under `[project-folder]/impl/pnr`. Click on Save to continue.

![Device Configuration](/img/tang-nano-setup/device_configuration.png)

Click on Program/Configure, wait until the upload and verification process finished.

![Program/Configure](/img/tang-nano-setup/program_configure.png)

Now the board is loaded with your design. Press the buttons to test it.

![Final 0](/img/tang-nano-setup/final0.png)
![Final 1](/img/tang-nano-setup/final1.png)

## Further Readings

- [Official Sipeed documentation](http://tangnano.sipeed.com/)
- [cinim's totorial (in Japanese)](https://qiita.com/ciniml/items/bb9723673c91d8374b63)
- [Tang Nano User](https://xesscorp.github.io/tang_nano_user/docs/_site/)
- [Gowin's documentations](http://www.gowinsemi.com.cn/faq.aspx)
- [Sipeed's download page (a collection of related documents)](http://dl.sipeed.com/TANG/Nano)
- [Official Tang Nano examples GitHub repository](https://github.com/sipeed/Tang-Nano-examples)

<style>
details
{
  cursor: pointer;
}
img
{
  -moz-transition: all 0.5s ease;
  -webkit-transition: all 0.5s ease;
  -o-transition: all 0.5s ease;
  transition: all 0.5s ease;
}
img:hover
{
  -moz-transform: scale(1.1);
  -webkit-transform: scale(1.1);
  -o-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
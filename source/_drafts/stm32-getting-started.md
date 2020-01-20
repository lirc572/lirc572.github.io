---
title: Getting Started with STM32
tags:
---

- Download and install STM32CubeIDE from the official ST website
- New Project, choose chip
- Setup RCC, Clock tree
- Change main.c ,etc
- Build project
- Change debug options
- Find `stm32f1x.cfg` under openocd directory
  - In linux: */opt/st/stm32cubeide_1.0.2/plugins/com.st.stm32cube.ide.mcu.debug_1.0.2.201907120816/resources/openocd/st_scripts/target/stm32f1x.cfg*
  - Change `set _CPUTAPID 0x1ba01477` to `set _CPUTAPID 0x2ba01477`
- Debug
- Run

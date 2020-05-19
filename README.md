# lirc572.github.io

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/lirc572/lirc572.github.io) 

To deploy the website:

**1.** Clone the repository:

```
git clone https://github.com/lirc572/lirc572.github.io.git
```

**2.** Install *Hexo-cli*:

```
npm install hexo-cli -g
```

**3.** Install dependencies:

Inside the root directory:
```
npm install
```

**4.** Modify git deploy settings in *_config.yml*:

```
deploy:
  type: git
  repo: git@github.com:lirc572/lirc572.github.io.git
  branch: master
```

**5.** Generate static files and deploy:

```
hexo g && hexo d
```

# URCl Explorer
An IDE for URCL

## Important notes ⚠️
Keep in mind that currently there is **no** saving functionality build into the website, thus make sure to save your code to a file before you close your browser tab.

## Run 🏃‍♂️
### Github Pages
You only need your browser to use urcl-explorer just go to [github pages](https://bramotte.github.io/urcl-explorer) and start writing and running URCL code.

### Local Server
To use the URCL website offline you will need to clone the repository to your computer, run a static http server and then connect to that server using your browser.

First clone the repo to your computer this can be done in the terminal like this:
```cmd
git clone https://github.com/BramOtte/urcl-explorer.git
```

Then navigate to the folder you just cloned to which is by default urcl-explorer.
```cmd
cd urcl-explorer
```

Install a static http server, an example of one is http-server which you can install using npm.
But you can use any other http server as long as it gives proper mime-types to javascript files.
```cmd
npm install -g http-server
```
And run it.
```
http-server -p 8000
```

Finally, open your browser and visit http://localhost:8000.

### Node.js
```
node js/node/urcx-emu.js [<...options>] <sourcefile>
```

## Install 🔩
### Node.js Windows 
Add the bin folder to your [Path environment variable](https://duckduckgo.com/?q=windows+add+to+path)
and run the emulator with the urcx-emu command:
```
urcx-emu [<...options>] <sourcefile>
```

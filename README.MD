# URCl Explorer
just an emulator now, but plans for more tools

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

Now run a static http server, an example of one is the one included with python but you can use any other http server.
```cmd
python -m http.server
```

Finally, open your browser and visit http://localhost:8000. The python http server uses port 8000 by default but this might be different, so check which port your server uses and connect to the right one.

### Node.js
```
node js/emulator/urcl-emu.js <filename>
```
# palworld-admin
Admin Pannel for Palworld Dedicated Server

This is a work in progress admin pannel for Palworld Server written in Node JS

Working Features:
* local auth
* show online players

Planned features:
* Login discord auth 
* show version number
* Bann Players
* Kick Players
* Server Stats (Memory, disk, CPU)

Setup:

* clone the repository
copy .env.default to .env

Modify .env as needed

As the rcon library used has an issue with packets the following modification needs to be done:

https://github.com/janispritzkau/rcon-client/issues/21

you need to change the file node_modules/rcon-client/lib/rcon.js around line 135 it should like this

const id = this.authenticated ? (packet.id + 1) : this.requestId - 1;

![Screenshot 2024-02-04 123200](https://github.com/acocalypso/palworld-admin/assets/2846629/bcc9d4a8-2327-4735-b9cc-05086f273790)

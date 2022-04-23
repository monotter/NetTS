# NetTS

You can use with both RobloxTS and Plain LuaU

## installation and importing

### RobloxTS

```npm
npm install @rbxts/net-ts
```

## Top Level Import
```ts
import Net from '@rbxts/net-ts'
                 
const net = new Net(
    'Character', // Event Workspace
	'ExcellentTech', // Package Workspace
	game.GetService("ReplicatedStorage") // Package Container
)
// default Event Workspace: "Main"
// default Package Workspace: "__Net__Workspace__"
// default Container: ReplicatedStorage
```

### Roblox LuaU

```lua
local Net = require(game.ReplicatedStorage.Net).default
--                  Event Workspace, Package Workspace, Package Container
local net = Net.new(
    "Character", -- Event Workspace
    "ExcellentTech", -- Package Workspace
    game.ReplicatedStorage -- Package Container
)
-- default Event Workspace: "Main"
-- default Package Workspace: "__Net__Workspace__"
-- default Container: ReplicatedStorage
```

Compiled file can be found in [out/src](github.com/monotter/NetTS/out/index.lua)

## Simplest Import
```ts
import Net from '@rbxts/net-ts'

const net = new Net('Character')
```

## Events Usage

### Server -> Client

To send data on Server to specific player, you have to specify `_player` property.

**Client**
```ts
net.addRemoteListener('random-event-name', ({ property1, property2, _player }) => {
    print(`First param: ${property1}, Second param: ${property2} `)
})
```

**Server**
```ts
net.emitRemote('random-event-name', { property1: 'example', property2: game.GetService("Workspace"), _player: game.GetService("Players").FindFirstChild("Monotter") as Player })
```
---
### Server -> Clients

if you do not specify `_player` it will automatically call `FireAllClients`.

**Client**
```ts
net.addRemoteListener('broadcast', ({ property1, property2 }: { property1: string, property2: Instance }) => {
    print(property2, property1)
})
```

**Server**
```ts
net.emitRemote('broadcast', { property1: 'example', property2: game.GetService("Workspace") })
```

---
### Client -> Server

if you do not specify `_player` it will automatically call `FireAllClients`.

**Client**
```ts
net.addRemoteListener('kick-itself', ({ reason, _player }: { reason: string, _player: Player }) => {
    _player.Kick(reason)
})
```

**Server**
```ts
net.emitRemote('kick-itself', { reason: 'uwu' })
```
---
### Server -> Server, Client -> Client

**Server / Client**
```ts
net.addListener('randomEvent', ({ a, c }: { a: string, c: string[] }) => {
    print(`b: ${a}, [d,e,f]: ${c} `)
})
```

**Server / Client**
```ts
net.emit('randomEvent', { a: 'b', c: ['d', 'e', 'f'] })
```
---
## Function Usage

Currently `Function Usage` only supports one receiver per `event workspace`.
---
### Client <-> Client, Server <-> Server

**Client <-> Client or Server <-> Server**
```ts
// Receiver
net.addListener('add', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 + num2 // -> now we can use return
}, true) // -> To making it function, simply add true at last parameter
```
**Client <-> Client or Server <-> Server**
```ts
// Sender
const result = net.emit('add', { num1: 20, num2: 11 }, true) // -> Same stuff goes here!
print(result) // -> Result will be printed. ;)
```
---
### Server <-> Client

To Server to Client on `Function Usage` you must specify `_player`. (Since there can be only 1 return there must be only 1 Client)

**Server <-> Client**
```ts
// Receiver
net.addRemoteListener('multiply', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 * num2
}, true)
```
**Server <-> Client**
```ts
// Sender
const result = net.emitRemote('multiply', { num1: 2, num2: 5, _player: game.Players.Monotter }, true)
print(result)
```
---
### Client <-> Server

**Client <-> Server**
```ts
// Receiver
net.addRemoteListener('multiply', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 * num2
}, true)
```

**Client <-> Server**
```ts
// Sender
const result = net.emitRemote('multiply', { num1: 2, num2: 5 }, true)
print(result)
```

## Important Notice
**I did not test LuaU so there is a might be a issue on that**
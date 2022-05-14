# NetTS

You can use with both RobloxTS and Plain LuaU

## installation and importing

### RobloxTS

```npm
npm install @rbxts/net-ts
```

## Import
```ts
import Net from '@rbxts/net-ts'
const net = new Net()
```

### Roblox LuaU

```lua
local Net = require(game.ReplicatedStorage.Net).default
local net = Net.new()
```

## Events Usage

### Server -> Client

To send data on Server to specific player, you have to specify `_player` property.

**Client**
```ts
net.addListener('random-event-name', ({ property1, property2 }) => {
    print(`First param: ${property1}, Second param: ${property2} `)
}, true)
```

**Server**
```ts
net.emit('random-event-name', { property1: 'example', property2: game.GetService("Workspace"), _player: game.GetService("Players").FindFirstChild("Monotter") as Player }, true)
```
---
### Server -> Clients

if you do not specify `_player` it will automatically call `FireAllClients`.

**Client**
```ts
net.addListener('broadcast', ({ property1, property2 }: { property1: string, property2: Instance }) => {
    print(property2, property1)
}, true)
```

**Server**
```ts
net.emit('broadcast', { property1: 'example', property2: game.GetService("Workspace") }, true)
```

---
### Client -> Server

if you do not specify `_player` it will automatically call `FireAllClients`.

**Client**
```ts
net.addListener('kick-itself', ({ reason, _player }: { reason: string, _player: Player }) => {
    _player.Kick(reason)
}, true)
```

**Server**
```ts
net.emit('kick-itself', { reason: 'uwu' })
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

> `Function Usage` only returns value of first returned listener.
##### Client <-> Client, Server <-> Server
```ts
// Sender
const result = net.emit('add', { num1: 20, num2: 11 }, false, true) // -> To making it function, simply add true at last parameter
print(result) // -> Result will be printed. ;)
```
```ts
// Receiver
net.addListener('add', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 + num2 // -> now we can use return
})
```
---
### Server -> Client


**Server -> Client**
```ts
// Receiver
net.addListener('multiply', ({ num1, num2 }: { num1: number, num2: number }) => {
    return num1 * num2
}, true)
```
```ts
// Sender
const result = net.emit('multiply', { num1: 2, num2: 5, _player: game.Players.Monotter }, true, true)
print(result)
```
## Important Notice
**I did not test examples that specified on here so there is a might be a issue on that**
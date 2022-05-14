interface options { [key: string | number]: any, _player?: Player }
type listener = (options?: any) => any


const ReplicatedStorage = game.GetService('ReplicatedStorage')
const HttpService = game.GetService('HttpService')
const RunService = game.GetService('RunService')


const IsServer = RunService.IsServer()
const EVENT_NAME = 'NetTS_Connection'
const RETURN_PREFIX = '$NETTS_RETURN$'

export default class Net {
    private RemoteEvent: RemoteEvent | undefined
    private BindableEvent: BindableEvent | undefined
    private TempClinet: boolean
    private Listeners: Map<string | number, { remote: boolean, listener: listener }[]>
    private ReturnWaiters: Map<string | number, { resolved: boolean, value?: any }>
    private LastConnections: RBXScriptConnection[]
    private EventWorkspace: string
    public reconnect() {
        this.LastConnections.forEach((connection) => connection.Disconnect())
        this.LastConnections.clear()
        while (!this.RemoteEvent || !this.BindableEvent) { task.wait() }
        if (IsServer) {
            this.LastConnections.push(
                this.RemoteEvent.OnServerEvent.Connect((player, ...args: unknown[]) => {
                    const EventWorkspace = args[0] as string
                    if (EventWorkspace !== this.EventWorkspace) { return }
                    const key = args[1] as string
                    if (key === RETURN_PREFIX) {
                        const UUID = args[2] as string
                        const value = args[3] as any
                        const waiter = this.ReturnWaiters.get(UUID)
                        if (!waiter) { return }
                        if (waiter.resolved) { return }
                        waiter.resolved = true
                        waiter.value = value
                        return
                    }
                    const options = (args[2] || {}) as options
                    options._player = player
                    const listeners = this.Listeners.get(key)
                    if (!listeners) { return }
                    let returned = false
                    const uuid: string = options._returnUUID
                    delete options._returnUUID
                    listeners.forEach(({ listener, remote }) => {
                        if (!remote) { return }
                        task.spawn(() => {
                            const value = listener(options)
                            if (returned) { return }
                            if (value) { returned = true } else { return }
                            if (!uuid) { return }
                            this.RemoteEvent!.FireClient(player, this.EventWorkspace, RETURN_PREFIX, uuid, value)
                        })
                    })
                })
            )
        } else {
            this.LastConnections.push(
                this.RemoteEvent.OnClientEvent.Connect((...args: unknown[]) => {
                    const EventWorkspace = args[0] as string
                    if (EventWorkspace !== this.EventWorkspace) { return }
                    const key = args[1] as string
                    if (key === RETURN_PREFIX) {
                        const UUID = args[2] as string
                        const value = args[3] as any
                        const waiter = this.ReturnWaiters.get(UUID)
                        if (!waiter) { return }
                        if (waiter.resolved) { return }
                        waiter.resolved = true
                        waiter.value = value
                        return
                    }
                    const options = (args[2] || {}) as options
                    const listeners = this.Listeners.get(key)
                    if (!listeners) { return }
                    let returned = false
                    const uuid: string = options._returnUUID
                    delete options._returnUUID
                    delete options._player
                    listeners.forEach(({ listener, remote }) => {
                        if (!remote) { return }
                        task.spawn(() => {
                            const value = listener(options)
                            if (returned) { return }
                            if (value) { returned = true } else { return }
                            if (!uuid) { return }
                            this.RemoteEvent!.FireServer(this.EventWorkspace, RETURN_PREFIX, uuid, value)
                        })
                    })
                })
            )
        }
        this.LastConnections.push(
            this.BindableEvent.Event.Connect((...args: unknown[]) => {
                const EventWorkspace = args[0] as string
                if (EventWorkspace !== this.EventWorkspace) { return }
                const key = args[1] as string
                if (key === RETURN_PREFIX) {
                    const UUID = args[2] as string
                    const value = args[3] as any
                    const waiter = this.ReturnWaiters.get(UUID)
                    if (!waiter) { return }
                    if (waiter.resolved) { return }
                    waiter.resolved = true
                    waiter.value = value
                    return
                }
                const options = (args[2] || {}) as options
                const listeners = this.Listeners.get(key)
                if (!listeners) { return }
                let returned = false
                const uuid: string = options._returnUUID
                delete options._returnUUID
                listeners.forEach(({ listener, remote }) => {
                    if (remote) { return }
                    task.spawn(() => {
                        const value = listener(options)
                        if (returned) { return }
                        if (value) { returned = true } else { return }
                        if (!uuid) { return }
                        this.BindableEvent!.Fire(this.EventWorkspace, RETURN_PREFIX, uuid, value)
                    })
                })
            })
        )
    }


    constructor(EventWorkspace: string = 'Main') {
        this.EventWorkspace = EventWorkspace
        this.LastConnections = []
        this.Listeners = new Map()
        this.ReturnWaiters = new Map()
        this.TempClinet = false
        let EventFolder = ReplicatedStorage.FindFirstChild(EVENT_NAME)
        if (EventFolder) {
            if (EventFolder.GetAttribute('IsServer')) {
                let RemoteEvent = EventFolder.WaitForChild('RemoteEvent') as RemoteEvent
                let BindableEvent = EventFolder.WaitForChild('BindableEvent') as BindableEvent
                this.RemoteEvent = RemoteEvent
                this.BindableEvent = BindableEvent
                this.reconnect()
            } else {
                this.TempClinet = true
            }
        } else {
            EventFolder = new Instance('Folder')
            EventFolder.Name = EVENT_NAME
            EventFolder.SetAttribute('IsServer', IsServer)
            EventFolder.Parent = ReplicatedStorage
            let RemoteEvent = new Instance('RemoteEvent', EventFolder)
            RemoteEvent.Name = 'RemoteEvent'
            let BindableEvent = new Instance('BindableEvent', EventFolder)
            BindableEvent.Name = 'BindableEvent'
            this.RemoteEvent = RemoteEvent
            this.BindableEvent = BindableEvent
            if (!IsServer) { this.TempClinet = true }
            this.reconnect()
        }
        if (this.TempClinet) {
            task.spawn(() => {
                let FullClient
                while (!FullClient) {
                    FullClient = ReplicatedStorage.GetChildren().find((children) => (children.Name === EVENT_NAME && !!children.GetAttribute('IsServer')))
                    task.wait()
                }
                let RemoteEvent = FullClient.WaitForChild('RemoteEvent') as RemoteEvent
                let BindableEvent = FullClient.WaitForChild('BindableEvent') as BindableEvent
                this.RemoteEvent = RemoteEvent
                this.BindableEvent = BindableEvent
                EventFolder!.Destroy()
                this.reconnect()
            })
        }
    }


    public addListener(key: string, listener: listener, remote: boolean = false) {
        if (!this.Listeners.has(key)) { this.Listeners.set(key, []) }
        this.Listeners.get(key)!.push({ remote, listener })
    }


    public removeListener(key: string, listener: listener) {
        if (!this.Listeners.has(key)) { return }
        const Listeners = this.Listeners.get(key)!.filter(({ listener: _listener }) => _listener !== listener)
        if (Listeners && Listeners.size() > 0) {
            this.Listeners.set(key, Listeners)
        } else {
            this.Listeners.delete(key)
        }
    }


    public emit(key: string, options: options = {}, remote: boolean = false, WaitForFirstReturn: boolean = false) {
        task.wait()
        if (WaitForFirstReturn) {
            options._returnUUID = HttpService.GenerateGUID()
            this.ReturnWaiters.set(options._returnUUID, { resolved: false })
        }


        if (remote) {
            while (!this.RemoteEvent) { task.wait() }
            if (IsServer) {
                if (options._player) {
                    this.RemoteEvent.FireClient(options._player, this.EventWorkspace, key, options)
                } else {
                    this.RemoteEvent.FireAllClients(this.EventWorkspace, key, options)
                }
            } else {
                this.RemoteEvent.FireServer(this.EventWorkspace, key, options)
            }
        } else {
            while (!this.BindableEvent) { task.wait() }
            this.BindableEvent.Fire(this.EventWorkspace, key, options)
        }


        if (WaitForFirstReturn) {
            while (!this.ReturnWaiters.get(options._returnUUID)!.resolved) { task.wait() }
            return this.ReturnWaiters.get(options._returnUUID)!.value
        }
    }
}
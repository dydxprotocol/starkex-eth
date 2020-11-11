export class DummyProvider {
  send(args: any, cb: any) {
    cb(null, { id: args.id, jsonrpc: '2.0', result: null });
  }

  sendAsync(args: any, cb: any) {
    cb(null, { id: args.id, jsonrpc: '2.0', result: null });
  }
}

import { decode, encode } from "../src/wire-protocol";

import { MessageType, JupyterMessageHeader } from "../src/types";

const convertToWireBuffer = el =>
  typeof el === "string" ? Buffer.from(el) : Buffer.from(JSON.stringify(el));

declare global {
  namespace jest {
    interface Matchers<R> {
      toEqualMessageFrames(actuals: Array<string | Buffer | Object>): R;
    }
  }
}

expect.extend({
  toEqualMessageFrames(
    receiveds: Buffer[],
    actuals: Array<string | Buffer | Object>
  ) {
    for (var i = 0; i < receiveds.length; i++) {
      const received = receiveds[i];
      const actual = actuals[i];

      // Normalize the actual to a buffer to match the received
      const normalizedActual = Buffer.isBuffer(actual)
        ? actual
        : typeof actual === "string"
        ? Buffer.from(actual)
        : Buffer.from(JSON.stringify(actual));

      const pass = Buffer.compare(received, normalizedActual) === 0;

      if (!pass) {
        return {
          message: () =>
            `expected ${received.toString()} to equal ${normalizedActual.toString()} in position ${i}`,
          pass
        };
      }
    }

    return {
      pass: true,
      message: () => `expected message frames to be the same`
    };
  }
});

test("encode", () => {
  const message = {
    parent_header: ({ msg_type: "fake" } as unknown) as JupyterMessageHeader,
    header: {
      msg_type: "display_data" as MessageType,
      msg_id: "0000",
      username: "jovyan",
      date: "2019-12-09T22:30:13.447Z",
      version: "54",
      session: "1111"
    } as JupyterMessageHeader,
    content: { y: 3 },
    metadata: { x: 2 }
  };

  expect(encode(message)).toEqualMessageFrames([
    "<IDS|MSG>",
    // HMAC signature
    "",
    // Header
    {
      msg_type: "display_data",
      msg_id: "0000",
      username: "jovyan",
      date: "2019-12-09T22:30:13.447Z",
      version: "54",
      session: "1111"
    },
    // Parent Header
    { msg_type: "fake" },
    // Metadata
    { x: 2 },
    // Content
    { y: 3 }
  ]);

  expect(encode(message, "secretkey")).toEqualMessageFrames([
    "<IDS|MSG>",
    // HMAC signature of the content below
    "0d2f2106fa48fed22402ab0a009d5c0dd62155ba0a02e7c21bf9c5ee4670b635",
    // Header
    {
      msg_type: "display_data",
      msg_id: "0000",
      username: "jovyan",
      date: "2019-12-09T22:30:13.447Z",
      version: "54",
      session: "1111"
    },
    // Parent Header
    { msg_type: "fake" },
    // Metadata
    { x: 2 },
    // Content
    { y: 3 }
  ]);
});

test("decode", () => {
  const encodedMessage = [
    "<IDS|MSG>",
    // HMAC signature of the content below
    "0d2f2106fa48fed22402ab0a009d5c0dd62155ba0a02e7c21bf9c5ee4670b635",
    // Header
    { msg_type: "protocol_test" },
    // Parent Header
    { msg_type: "fake" },
    // Metadata
    { x: 2 },
    // Content
    { y: 3 }
  ].map(el =>
    typeof el === "string" ? Buffer.from(el) : Buffer.from(JSON.stringify(el))
  );

  expect(decode(encodedMessage)).toEqual({
    parent_header: { msg_type: "fake" },
    header: { msg_type: "protocol_test" },
    content: { y: 3 },
    metadata: { x: 2 },
    buffers: [],
    idents: []
  });
});

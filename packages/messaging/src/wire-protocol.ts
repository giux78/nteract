const crypt = require("crypto");

import { JupyterMessageHeader, MessageType } from "./types";

const WIRE_PROTOCOL_DELIMITER = "<IDS|MSG>";

// There must be at least 5 frames after the delimiter:
// HMAC signature, serialized header, serialized parent header,
// serialized metadata, serialized content
const REQUIRED_NUMBER_OF_MESSAGE_FRAMES = 5;

function toJSON(value: any) {
  return JSON.parse(value.toString());
}

export interface RawJupyterMessage<
  MT extends MessageType = MessageType,
  C = any
> {
  header: JupyterMessageHeader<MT>;
  parent_header:
    | JupyterMessageHeader<any>
    | {
        msg_id?: string;
      };
  metadata: object;
  content: C;
  buffers: Array<Buffer>;
  idents: Array<Buffer>;
}

function initializeMessage(
  _message: Partial<RawJupyterMessage>
): RawJupyterMessage {
  const message = Object.assign(
    {},
    {
      header: {},
      parent_header: {},
      metadata: {},
      content: {},
      idents: [],
      buffers: []
    },
    _message
  );

  return message;
}

/**
 * Convert from Pythonic HMAC scheme string to node.js compatible name.
 *
 * Only support sha256 at the moment, which is all Jupyter uses nowadays anyhow.
 *
 * @param _scheme Examples: "hmac-sha256", "sha256"
 */
function identifyHMACScheme(_scheme: string) {
  let scheme = _scheme;
  switch (_scheme) {
    case "hmac-sha256":
      scheme = "sha256";
      break;
  }

  return scheme;
}

/**
 * Convert raw message frames from a Jupyter ZeroMQ connection to the object based JupyterMessage format
 *
 * @param messageFrames individual components of a message
 * @param _scheme only sha256 is supported at the moment
 * @param key HMAC key for frames 2+
 */
export function decode(
  messageFrames: Array<Buffer>,
  key?: string,
  _scheme = "sha256"
): RawJupyterMessage {
  var i = 0;
  const idents = [];
  for (i = 0; i < messageFrames.length; i++) {
    var frame = messageFrames[i];
    if (frame.toString() === WIRE_PROTOCOL_DELIMITER) {
      break;
    }
    idents.push(frame);
  }

  if (messageFrames.length - i < REQUIRED_NUMBER_OF_MESSAGE_FRAMES) {
    throw new Error("Message Decoding: Not enough message frames");
  }

  if (messageFrames[i].toString() !== WIRE_PROTOCOL_DELIMITER) {
    throw new Error("Message Decoding: Missing delimiter");
  }

  if (key) {
    const scheme = identifyHMACScheme(_scheme);
    var obtainedSignature = messageFrames[i + 1].toString();

    var hmac = crypt.createHmac(scheme, key);
    hmac.update(messageFrames[i + 2]);
    hmac.update(messageFrames[i + 3]);
    hmac.update(messageFrames[i + 4]);
    hmac.update(messageFrames[i + 5]);
    var expectedSignature = hmac.digest("hex");

    if (expectedSignature !== obtainedSignature) {
      throw new Error(`Message Decoding: Incorrect;
Obtained "${obtainedSignature}"
Expected "${expectedSignature}"`);
    }
  }

  var message = initializeMessage({
    idents: idents,
    header: toJSON(messageFrames[i + 2]),
    parent_header: toJSON(messageFrames[i + 3]),
    content: toJSON(messageFrames[i + 5]),
    metadata: toJSON(messageFrames[i + 4]),
    buffers: Array.prototype.slice.apply(messageFrames, [i + 6])
  });

  return message;
}

/**
 * Convert from the object based jupyter message to raw message frames
 */
export function encode(
  _message: Partial<RawJupyterMessage>,
  key?: string,
  _scheme = "sha256"
) {
  // Ensure defaults are set for the message
  const message = initializeMessage(_message);

  const scheme = identifyHMACScheme(_scheme);

  const idents = message.idents;

  const header = Buffer.from(JSON.stringify(message.header), "utf-8");
  const parent_header = Buffer.from(
    JSON.stringify(message.parent_header),
    "utf-8"
  );
  const metadata = Buffer.from(JSON.stringify(message.metadata), "utf-8");
  const content = Buffer.from(JSON.stringify(message.content), "utf-8");

  let signature = "";
  if (key) {
    const hmac = crypt.createHmac(scheme, key);
    hmac.update(header);
    hmac.update(parent_header);
    hmac.update(metadata);
    hmac.update(content);
    signature = hmac.digest("hex");
  }

  var response = idents
    .concat([
      // idents
      Buffer.from(WIRE_PROTOCOL_DELIMITER), // delimiter
      Buffer.from(signature), // HMAC signature
      header, // header
      parent_header, // parent header
      metadata, // metadata
      content // content
    ])
    .concat(message.buffers);

  return response;
}

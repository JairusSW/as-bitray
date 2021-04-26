const hexLookupTable = ['00','01','02','03','04','05','06','07','08','09','0a','0b','0c','0d','0e','0f','10','11','12','13','14','15','16','17','18','19','1a','1b','1c','1d','1e','1f','20','21','22','23','24','25','26','27','28','29','2a','2b','2c','2d','2e','2f','30','31','32','33','34','35','36','37','38','39','3a','3b','3c','3d','3e','3f','40','41','42','43','44','45','46','47','48','49','4a','4b','4c','4d','4e','4f','50','51','52','53','54','55','56','57','58','59','5a','5b','5c','5d','5e','5f','60','61','62','63','64','65','66','67','68','69','6a','6b','6c','6d','6e','6f','70','71','72','73','74','75','76','77','78','79','7a','7b','7c','7d','7e','7f','80','81','82','83','84','85','86','87','88','89','8a','8b','8c','8d','8e','8f','90','91','92','93','94','95','96','97','98','99','9a','9b','9c','9d','9e','9f','a0','a1','a2','a3','a4','a5','a6','a7','a8','a9','aa','ab','ac','ad','ae','af','b0','b1','b2','b3','b4','b5','b6','b7','b8','b9','ba','bb','bc','bd','be','bf','c0','c1','c2','c3','c4','c5','c6','c7','c8','c9','ca','cb','cc','cd','ce','cf','d0','d1','d2','d3','d4','d5','d6','d7','d8','d9','da','db','dc','dd','de','df','e0','e1','e2','e3','e4','e5','e6','e7','e8','e9','ea','eb','ec','ed','ee','ef','f0','f1','f2','f3','f4','f5','f6','f7','f8','f9','fa','fb','fc','fd','fe','ff']
  
export class Bitray extends Uint8Array {

  public binary: Uint8Array

  constructor(data: string, encoding: string) {

    let binary: Uint8Array

    if (typeof encoding !== 'string' || encoding === '') {

      encoding = 'utf8'

    }

    if (encoding === 'utf8' || encoding === 'utf-8') {

      binary = Uint8Array.wrap(String.UTF8.encode(data))

    } else if (['latin1', 'binary'].includes(encoding)) {
        
      binary = latinDecode(data)

    } else if (encoding === 'hex') {
        
      binary = hexDecode(data)

    } else if (['ucs2', 'ucs-2', 'utf16le', 'utf-16le'].includes(encoding)) {

     binary = Uint8Array.wrap(String.UTF16.encode(data))

    } else if (encoding === 'base64') {

      binary = toByteArray(data)

    } else {

      throw new Error('Unknown Encoding Provided. Recieved Encoding ' + encoding + '')

    }

    super(binary.length)

    for (let i = 0; i < binary.length; i++) {
        
      super.fill(binary[i], i, i + 1)

    }

    this.binary = binary

  }

  toFormat(encoding: string): string {

    if (['utf-8', 'utf8'].includes(encoding)) {

      return String.UTF8.decode(this.binary.buffer)

    } else if (['binary', 'latin1'].includes(encoding)) {
      let ret = ''
      for (let i = 0; i < this.binary.length; ++i) {
        ret += String.fromCharCode(this.binary[i])
      }
      return ret
    } else if (['hex'].includes(encoding)) {

      let out = ''

      for (let i = 0; i < this.binary.byteLength; ++i) {

        out += hexLookupTable[this.binary[i]]

      }

      return out

    } else if (['ucs2', 'ucs-2', 'utf16le', 'utf-16le'].includes(encoding)) {

      return String.UTF16.decode(this.buffer)

    } else if (encoding === 'base64') {

      return fromByteArray(this.binary)

    } else {

      return ''

    }

  }

}

export function from (array: Uint8Array) {

  const bit = new Bitray('', '')

  bit.binary = array
  
  return bit

}

let lookup: Array<string> = []
let revLookup: Array<u32> = []
let code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (let i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code.charAt(i)
  revLookup[code.charCodeAt(i)] = i
}
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64: string): Uint8Array {
  let len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }
  let validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len
  let placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  const uin8 = new Uint8Array(2)
  uin8[0] = validLen
  uin8[1] = placeHoldersLen

  return uin8
}

function toByteArray (b64: string): Uint8Array {
  let tmp: u32
  let lens = getLens(b64)
  let validLen = lens[0]
  let placeHoldersLen = lens[1]
  let arr = new Uint8Array(((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen)
  let curByte = 0
  let len = placeHoldersLen > 0
    ? validLen - 4
    : validLen
  let i: u32
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }
  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }
  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }
  return arr
}

function tripletToBase64 (num: u32): string {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8: Uint8Array, start: u32, end: number): string {
  let tmp: u32
  let output: Array<string> = []
  for (let i: u32 = start; i < end; i += 3) {
    tmp =
      ((u32(uint8[i]) << 16) & 0xFF0000) +
      ((u32(uint8[i + 1]) << 8) & 0xFF00) +
      (u32(uint8[i + 2]) & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8: Uint8Array): string {
  let tmp: u32
  let len = uint8.length
  let extraBytes = len % 3
  let parts: Array<string> = []
  let maxChunkLength = 16383
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }
  return parts.join('')
}

function hexDecode (str: string): Uint8Array {
  const byteArray = new Uint8Array(str.length >>> 1)
  const strArray = str.split('')
  let pos = 0
  for (let i = 0; i < str.length / 2; ++i) {
      let hex = '' + strArray[pos] + '' + strArray[pos + 1] + ''
      byteArray[i] = u32(parseInt('0x' + hex + '', 16))
      pos = pos + 2
  }
  return byteArray
}
function latinDecode (str: string): Uint8Array {
  const byteArray = new Uint8Array(str.length)
  for (let i = 0; i < str.length; ++i) {
    byteArray[i] = str.charCodeAt(i)
  }
  return byteArray
}
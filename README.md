# Bitray 
**A Small Utility For Handling Binary Data Written In AssemblyScript**

## About
- AssemblyScript Compatible
- Small And Fast
- Works In Browser And Node
- Zero Dependencies

## Installation
```bash
~ npm install as-bitray --save
```

## Usage

**Basic Usage**
```js
import { Bitray } from 'as-bitray'

const bit = new Bitray('Hello World 🌎', 'utf8')
//=> Bitray
bit.toFormat('hex')
//==> 48656c6c...
```

**ArrayLike to Bitray**

```js
import { Bitray, from } from 'as-bitray'

const bit = from([152, 83, 34, 125])
//=> Bitray

bit.toFormat('hex')
//==> 48656c6c...
```

## Encodings
Binray Supports The Following Encodings:
- **Utf-8**
- **Base64**
- **Hex**
- **Binary/Latin1**
- **Ucs2**
- **Utf16**

## API

### new Bitray(string, format) -->> Uint8Array
Creates A New Bitray Instance. Built On Top Of Uint8Array.

### .toFormat(encoding) -->> String
Convert Bitray Into A String Encoding.

## Performance

**Encode Performance**
![Encode](https://cdn.discordapp.com/attachments/809588495425208320/819996033743978567/GNo7sAhYBCwCFgGLgEXAImARsAg0DQI2AGmaobIXahGwCFgELAIWAYuARcAiYBFofgTP5hxUvRJGiGAAAAAElFTkSuQmCC.png)

**Decode Performance**
![Decode](https://cdn.discordapp.com/attachments/809588495425208320/819996178740543528/e3F5sinmNgAAAAASUVORK5CYII.png)

## Notes

- Does not accept Array/Uint8Array as input

**As always, please star on GitHub! 😊**
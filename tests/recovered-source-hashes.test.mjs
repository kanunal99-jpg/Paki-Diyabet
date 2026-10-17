import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Source provenance: original Paki-Diyabet-Kayit-Giris-Kod-Duzeltmesi.zip,
// verified with SHA256.json. These hashes are Git SHA-1 content identities.
// This protects exact restoration and DOES NOT certify a complete app/build.
const recovered = {
  'lib/auth-errors.ts': '0f8a0dccc1d4299bc9ec39420f93a4a86f879e69',
  'lib/server-diagnostics.ts': '78f254b7efd4244be05b67287253793024da60e3',
  'app/diagnostic-center.tsx': 'd571d735d6ec7340e5cb44ebc58eee5b6b5b2663',
  'app/chatgpt-auth.ts': '2ad35fc3adb9d62e0368d9a0131031f2b1e22db9',
  'lib/client-diagnostics.ts': 'c6fac2be0fd40f62e37563c774bb5289d8e30c8e',
  'app/auth-client.tsx': 'fa7f02bdbe29bf1d0a307375bbbbbd0ff23eb9e1',
  'app/api/diagnostics/route.ts': '84db369887fc7ea5306a3d8d51add689d0b94c28',
  'app/api/feedback/route.ts': 'e04d6c81d08ecb3a4b7e3b7f36bae635e651d54f',
  'app/api/shared/route.ts': '8cdfe705509578a4f12ac2357ae49c2ede341755',
  'app/api/stock-use/route.ts': 'f804e885caf57467135ff99a25fd4be58009ef5d',
  'lib/diagnostics.ts': 'c220d0c1f0885b369fa4757bb2f473cf87aba9c5',
};
for (const [name,expected] of Object.entries(recovered)) {
  test('recovered archive source unchanged: '+name,()=>{
    const b=readFileSync(name);
    const digest=createHash('sha1').update('blob '+b.length+'\u0000').update(b).digest('hex');
    assert.equal(digest,expected,
      'Source divergence from verified ZIP. Investigate before production.');
  });
}

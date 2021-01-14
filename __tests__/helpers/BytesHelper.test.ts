import { getAssetId } from '../../src/lib/BytesHelper';

describe('BytesHelper', () => {
  it('getAssetId', () => {
    expect(getAssetId('0x8707a5bf4c2842d46b31a405ba41b858c0f876c4', 1)).toEqual(
      '0x02c04d8b650f44092278a7cb1e1028c82025dff622db96c934b611b84cc8de5a',
    );
  });
});

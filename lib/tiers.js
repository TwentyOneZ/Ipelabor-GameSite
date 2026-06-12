export const TIERS = [
  {
    name: 'Parceiro Inicial',
    minClients: 0,
    maxClients: 10,
    packageCommission: 150.00,
    nr01LifeCommission: 1.00,
    nextTierName: 'Parceiro Bronze',
    nextTierRequirement: 11
  },
  {
    name: 'Parceiro Bronze',
    minClients: 11,
    maxClients: 19,
    packageCommission: 180.00,
    nr01LifeCommission: 1.25,
    nextTierName: 'Parceiro Ouro',
    nextTierRequirement: 20
  },
  {
    name: 'Parceiro Ouro',
    minClients: 20,
    maxClients: 39,
    packageCommission: 210.00,
    nr01LifeCommission: 1.50,
    nextTierName: 'Parceiro Diamante',
    nextTierRequirement: 40
  },
  {
    name: 'Parceiro Diamante',
    minClients: 40,
    maxClients: Infinity,
    packageCommission: 250.00,
    nr01LifeCommission: 2.00,
    nextTierName: null,
    nextTierRequirement: null
  }
];

export function getTier(clientCount) {
  // Find matching tier
  return TIERS.find(t => clientCount >= t.minClients && clientCount <= t.maxClients) || TIERS[0];
}

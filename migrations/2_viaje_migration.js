var Viaje = artifacts.require("./Transporte.sol");

module.exports = function(deployer) {
  deployer.deploy(Viaje);
};

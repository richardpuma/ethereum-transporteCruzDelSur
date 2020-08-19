pragma solidity ^0.4.24;

contract Transporte {

  address public owner;

  struct Customer {
      uint loyaltyPoints;
      uint totalViajes;
  }  

  struct Viaje {
      string nombre;
      uint256 precio;
  }

  uint etherPerPoint = 0.5 ether;

  Viaje[] public viajes;

  mapping(address => Customer) public customers;
  mapping(address => Viaje[]) public customerViajes;
  mapping(address => uint) public customerTotalViajes;
  
  event ViajeComprado(address indexed customer, uint precio, string viaje);

  constructor() {
      owner = msg.sender;   
      viajes.push(Viaje('Ica', 4 ether));
      viajes.push(Viaje('Cusco', 3 ether));
      viajes.push(Viaje('Piura', 3 ether));
  }   

  function comprarViaje(uint viajeIndex) public payable {
      Viaje viaje = viajes[viajeIndex];
      require(msg.value == viaje.precio);

      Customer storage customer = customers[msg.sender];
      customer.loyaltyPoints += 5;
      customer.totalViajes += 1;
      customerViajes[msg.sender].push(viaje);
      customerTotalViajes[msg.sender] ++;

      ViajeComprado(msg.sender, viaje.precio, viaje.nombre);
  }

  function totalViajes() public view returns (uint) {
      return viajes.length;
  }

  function canjearPuntosFidelidad() public {
      Customer storage customer = customers[msg.sender];
      uint etherToRefund = etherPerPoint * customer.loyaltyPoints;
      msg.sender.transfer(etherToRefund);
      customer.loyaltyPoints = 0;
  }

  function getReembolsoEther() public view returns (uint) {
      return etherPerPoint * customers[msg.sender].loyaltyPoints;
  }

  function getViajeBalance() public isOwner view returns (uint) {
      address viajeAddress = this;
      return viajeAddress.balance;
  }

  modifier isOwner() {
      require(msg.sender == owner);
      _;
  }
}
pragma solidity ^0.4.24;

contract Transporte {

  address public owner;

  struct Customer {
      uint loyaltyPoints;
      uint totalPasajes;
  }  

  struct Pasaje {
      string nombre;
      uint256 precio;
  }

  uint etherPerPoint = 0.5 ether;

  Pasaje[] public pasajes;

  mapping(address => Customer) public customers;
  mapping(address => Pasaje[]) public customerPasajes;
  mapping(address => uint) public customerTotalPasajes;
  
  event PasajeComprado(address indexed customer, uint precio, string pasaje);

  constructor() {
      owner = msg.sender;   
      pasajes.push(Pasaje('AREQUIPA', 3 ether));
      pasajes.push(Pasaje('CAJAMARCA', 4 ether));
      pasajes.push(Pasaje('CHICLAYO', 3 ether));
      pasajes.push(Pasaje('HUARAZ', 3 ether));
      pasajes.push(Pasaje('LIMA', 4 ether));
      pasajes.push(Pasaje('TRUJILLO', 3 ether));
      pasajes.push(Pasaje('PIURA', 3 ether));
      pasajes.push(Pasaje('TUMBES', 4 ether));
      pasajes.push(Pasaje('TACNA', 3 ether));      
  }   

  function comprarPasaje(uint pasajeIndex) public payable {
      Pasaje pasaje = pasajes[pasajeIndex];
      require(msg.value == pasaje.precio);

      Customer storage customer = customers[msg.sender];
      customer.loyaltyPoints += 5;
      customer.totalPasajes += 1;
      customerPasajes[msg.sender].push(pasaje);
      customerTotalPasajes[msg.sender] ++;

      PasajeComprado(msg.sender, pasaje.precio, pasaje.nombre);
  }

  function totalPasajes() public view returns (uint) {
      return pasajes.length;
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

  function getPasajeBalance() public isOwner view returns (uint) {
      address pasajeAddress = this;
      return pasajeAddress.balance;
  }

  modifier isOwner() {
      require(msg.sender == owner);
      _;
  }
}
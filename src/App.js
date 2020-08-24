import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from "./airline";
import { AirlineService } from "./airlineService";
import { ToastContainer } from "react-toastr";

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            balance: 0,
            refundableEther: 0,
            account: undefined,
            flights: [],
            customerFlights: []
        };
    }

    async componentDidMount() {

        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.airlineService = new AirlineService(this.airline);

        var account = (await this.web3.eth.getAccounts())[0];

        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch(function (err, result) {

            const { customer, price, flight } = result.args;

            if (customer === this.state.account) {
                console.log(`Has comprado una pasaje a ${flight} por el precio de ${price} ETH`);
            } else {
                this.container.success(`El último cliente compró un pasaje a ${flight}
                por el precio de ${price} ETH`, 'Informacion de Compra');
            }

        }.bind(this));


        this.web3.currentProvider.publicConfigStore.on('update', async function (event) {
            this.setState({
                account: event.selectedAddress.toLowerCase()
            }, () => {
                this.load();
            });
        }.bind(this));

        this.setState({
            account: account.toLowerCase()
        }, () => {
            this.load();
        });
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights() {
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights
        });
    }

    async getRefundableEther() {
        let refundableEther = this.toEther((await this.airlineService.getRefundableEther(this.state.account)));
        this.setState({
            refundableEther
        });
    }

    async refundLoyaltyPoints() {
        await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }

    async getCustomerFlights() {
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        });
    }

    async buyFlight(flightIndex, flight) {

        await this.airlineService.buyFlight(
            flightIndex,
            this.state.account,
            flight.price
        );
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron" style={{ backgroundImage: "url(" + "https://www.cruzdelsur.com.pe/assets/images/servicios/sliders/evolution.jpg" + ")", color:"white", paddingTop: 50, paddingBottom: 150, fontWeight: "bold"}} >
                <h4 className="display-4" style={{backgroundColor: "#47484A"}}>Empresa de transportes Cruz del Sur</h4>
            </div>

            <div className="row">
                <div className="col-sm" style={{ backgroundColor: "#005592 !important" }}>
                    <Panel title="Saldo acumulado"  >
                        <p><strong>Cliente: {this.state.account}</strong></p>
                        <hr></hr>
                        <span><strong>Saldo actual</strong>: {this.state.balance} ETH</span>
                        <hr></hr>
                        <span><strong>Total puntos</strong>: {this.state.refundableEther} ETH</span>
                        <button className="btn bg-success text-white"
                            onClick={this.refundLoyaltyPoints.bind(this)}>Cobrar mis puntos</button>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Destinos - Perú" style={{backgroundColor: "#47484A" }}>
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                <div className="row">
                                    <div className="col-sm"> 
                                        <span>{flight.name} </span>
                                    </div>
                                    <div className="col-sm"> 
                                        <span> Precio: {this.toEther(flight.price)} ETH</span>
                                    </div>                                    
                                    <div className="col-sm"> 
                                    <button className="btn btn-success text-white" onClick={() => this.buyFlight(i, flight)}>Comprar pasaje</button>
                                    </div>                                    
                                </div>

                            </div>
                        })}

                    </Panel>
                </div>
            </div>
            <div className="row">

                <div className="col-sm">
                    <Panel title="Historial de mis compras" style={{backgroundColor: "#47484A" }}>
                        {this.state.customerFlights.map((flight, i) => {
                            return <div key={i}>

                               <div className="row">
                                    <div className="col-sm"> 
                                        <span> Pasaje comprado...  </span>
                                    </div>                                   
                                    <div className="col-sm"> 
                                        <span> <strong>Destino:</strong> {flight.name} </span>
                                    </div>
                                    <div className="col-sm"> 
                                        <span>  <strong>Precio:</strong> {flight.price} ETH</span>
                                    </div>                                                                      
                                </div>                               
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input}
                className="toast-top-right" />
        </React.Fragment>
    }
}
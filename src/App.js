import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import TransporteContract from "./transporte";
import { TransporteService } from "./transporteService";
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
            pasajes: [],
            customerPasajes: []
        };
    }

    async componentDidMount() {

        this.web3 = await getWeb3();
        this.toEther = converter(this.web3);
        this.transporte = await TransporteContract(this.web3.currentProvider);
        this.transporteService = new TransporteService(this.transporte);

        var account = (await this.web3.eth.getAccounts())[0];

        let pasajeComprado = this.transporte.PasajeComprado();
        pasajeComprado.watch(function (err, result) {

            const { customer, precio, pasaje } = result.args;

            if (customer === this.state.account) {
                console.log(`Has comprado una pasaje a ${pasaje} por el precio de ${precio} ETH`);
            } else {
                this.container.success(`El último cliente compró un pasaje a ${pasaje}
                por el precio de ${precio} ETH`, 'Informacion de Compra');
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

    async getPasajes() {
        let pasajes = await this.transporteService.getPasajes();
        this.setState({
            pasajes
        });
    }

    async getReembolsoEther() {
        let refundableEther = this.toEther((await this.transporteService.getReembolsoEther(this.state.account)));
        this.setState({
            refundableEther
        });
    }

    async refundLoyaltyPoints() {
        await this.transporteService.canjearPuntosFidelidad(this.state.account);
    }

    async getCustomerPasajes() {
        let customerPasajes = await this.transporteService.getCustomerPasajes(this.state.account);
        this.setState({
            customerPasajes
        });
    }

    async comprarPasaje(pasajeIndex, pasaje) {

        await this.transporteService.comprarPasaje(
            pasajeIndex,
            this.state.account,
            pasaje.precio
        );
    }

    async load() {
        this.getBalance();
        this.getPasajes();
        this.getCustomerPasajes();
        this.getReembolsoEther();
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
                        {this.state.pasajes.map((pasaje, i) => {
                            return <div key={i}>
                                <div className="row">
                                    <div className="col-sm"> 
                                        <span>{pasaje.nombre} </span>
                                    </div>
                                    <div className="col-sm"> 
                                        <span> Precio: {this.toEther(pasaje.precio)} ETH</span>
                                    </div>                                    
                                    <div className="col-sm"> 
                                    <button className="btn btn-success text-white" onClick={() => this.comprarPasaje(i, pasaje)}>Comprar pasaje</button>
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
                        {this.state.customerPasajes.map((pasaje, i) => {
                            return <div key={i}>

                               <div className="row">
                                    <div className="col-sm"> 
                                        <span> Pasaje comprado...  </span>
                                    </div>                                   
                                    <div className="col-sm"> 
                                        <span> <strong>Destino:</strong> {pasaje.nombre} </span>
                                    </div>
                                    <div className="col-sm"> 
                                        <span>  <strong>Precio:</strong> {pasaje.precio} ETH</span>
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
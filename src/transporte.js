import TransporteContract from "../build/contracts/Transporte.json";
import contract from "truffle-contract";

export default async(provider) => {
    const transporte = contract(TransporteContract);
    transporte.setProvider(provider);

    let instance = await transporte.deployed();
    return instance;
};
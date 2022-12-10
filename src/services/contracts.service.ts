import { Injectable, Logger } from '@nestjs/common';
import { ethers, BigNumber, Wallet } from 'ethers';
import ABI from '../constants/abis';
import { ADDRESSES } from '@src/constants';
import { Allowance, Balance, TotalSupply, Tx, Scores, Level, Number, Owner } from '@src/interfaces';
import { ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums/env.enum';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);
  
  constructor(
        private readonly configService: ConfigService
    ) {}

  public async sleepRewardBatch(addresses: String[], amounts: number[]): Promise<String | undefined> {
    try {
      // Provider
      const provider = new ethers.providers.JsonRpcProvider(String(this.configService.get<string>(EEnvKeys.INFURA_RPC)));

      // Signer
      const signer = new ethers.Wallet(String(this.configService.get<string>(EEnvKeys.PRIVATE_KEY)), provider);
      
      // Contract
      const sheepyInstance = new ethers.Contract(
        ADDRESSES.CONTRACTS_ADDRESSES.SHEEPY_CONTRACT_ADDRESS, 
        ABI.sheepy, 
        provider
      );

      // Amounts to mint in Wei
      const amountsInWei = [];
      for (let i = 0; i < amounts.length; i++) {
        amountsInWei[i] = ethers.utils.parseEther(amounts[i].toString());
      }

      // Gas estimation
      const gas = await sheepyInstance.connect(signer).estimateGas.sleepRewardBatch(
        addresses,
        amountsInWei
      );
      this.logger.debug('sleepRewardBatch : Estimated gas for the transaction:', gas.toNumber());
      const gasPrice = await sheepyInstance.connect(signer).provider.getGasPrice();

      // Sending the TX
      const tx = await sheepyInstance.connect(signer).sleepRewardBatch(
        addresses,
        amountsInWei,
        {
          gasLimit: gas.mul(1.5),
          gasPrice: gasPrice.mul(120).div(100)
        }
      );
      this.logger.debug('sleepRewardBatch : Tx sent ! Waiting for his validation');
      await tx.wait();
      this.logger.log('sleepRewardBatch : Tx has been executed: ' + tx.hash);
      return String(tx.hash);
    } catch (error) {
      this.logger.error(error);
    }
    return undefined;
  }

  public async healthRewardBatch(addresses: String[], amounts: number[]): Promise<String | undefined> {
    try {
      // Provider
      const provider = new ethers.providers.JsonRpcProvider(String(this.configService.get<string>(EEnvKeys.INFURA_RPC)));

      // Signer
      const signer = new ethers.Wallet(String(this.configService.get<string>(EEnvKeys.PRIVATE_KEY)), provider);
      
      // Contract
      const sheepyInstance = new ethers.Contract(
        ADDRESSES.CONTRACTS_ADDRESSES.SHEEPY_CONTRACT_ADDRESS, 
        ABI.sheepy, 
        provider
      );

      // Amounts to mint in Wei
      const amountsInWei = [];
      for (let i = 0; i < amounts.length; i++) {
        amountsInWei[i] = ethers.utils.parseEther(amounts[i].toString());
      }

      // Gas estimation
      const gas = await sheepyInstance.connect(signer).estimateGas.healthRewardBatch(
        addresses,
        amountsInWei
      );
      this.logger.debug('healthRewardBatch : Estimated gas for the transaction:', gas.toNumber());
      const gasPrice = await sheepyInstance.connect(signer).provider.getGasPrice();

      // Sending the TX
      const tx = await sheepyInstance.connect(signer).healthRewardBatch(
        addresses,
        amountsInWei,
        {
          gasLimit: gas.mul(1.5),
          gasPrice: gasPrice.mul(120).div(100)
        }
      );
      this.logger.debug('healthRewardBatch : Tx sent ! Waiting for his validation');
      await tx.wait();
      this.logger.log('healthRewardBatch : Tx has been executed: ' + tx.hash);
      return String(tx.hash);
    } catch (error) {
      this.logger.error(error);
    }
    return undefined;
  }

  public async getDataBedroomNfts(tokenIds: number[]): Promise<{owners: String[], values: number[]}> {
    // Provider
    const provider = new ethers.providers.JsonRpcProvider(String(this.configService.get<string>(EEnvKeys.INFURA_RPC)));

    // Contract
    const bedroomNftInstance = new ethers.Contract(
      ADDRESSES.CONTRACTS_ADDRESSES.BEDROOMNFT_CONTRACT_ADDRESS, 
      ABI.bedroomNft, 
      provider
    );

    // Gets the data of Nfts
    const data: any[] = await bedroomNftInstance.getDataBatch(tokenIds);

    // Gets only Owner + Value
    let owners: any[] = [];
    let values: any[] = [];
    for (let i = 0; i < data.length; i++) {
      owners[i] = data[i][4];
      values[i] = data[i][6];
    }

    // Return the data 
    return {owners, values}
  }

}
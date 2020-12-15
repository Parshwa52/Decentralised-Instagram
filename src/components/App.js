import Decentragram from '../abis/Decentragram.json'
import React, { Component } from 'react';
import Identicon from 'identicon.js';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentDidMount()
  {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }
  async loadWeb3()
  {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      // Acccounts always exposed
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData()
  {
    const web3=window.web3;
    const accounts=await web3.eth.getAccounts();
    //var paccount = accounts[0];
    //var oldaccount=this.state.account;
    this.setState({account:accounts[0]});
    window.ethereum.on('accountsChanged', function (accounts) {
      // Time to reload your interface with accounts[0]!
      this.setState({account:accounts[0]});
    }.bind(this));

    console.log(web3);
    console.log(accounts);
   // 
    const networkId=await web3.eth.net.getId();
    const networkdata=Decentragram.networks[networkId];
    if(networkdata)
    {
      const decentragram=new web3.eth.Contract(Decentragram.abi,networkdata.address);
      console.log(decentragram);
      this.setState({decentragram});
      const imagecount=await decentragram.methods.imagecount().call();
      this.setState({imagescount:imagecount,loading:false});
      for(var i=1;i<=imagecount;i++)
      {
          const image=await decentragram.methods.images(i).call();
          this.setState({
            images:[...this.state.images,image]
          });
         // console.log(this.state.images);
         
      }
      this.setState({images:this.state.images.sort((a,b)=>b.tipamount-a.tipamount)});
      this.setState({loading:false});
    }
    else
    {
      window.alert("Decentragram contract has not been deployed to detected network");
    }
    
  }

  captureFile=event=>{
    event.preventDefault();
    const file=event.target.files[0];
    const reader=new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend=()=>{
      this.setState({buffer:Buffer(reader.result)});
      console.log("buffer",this.state.buffer);
    }
  }

  tipImageOwner=(id,tipamount)=>{
    this.setState({loading:true});
    this.state.decentragram.methods.tipImageOwner(id).send({from:this.state.account,value:tipamount});
      this.setState({ loading: false });
 
}
  uploadImage=description=>{
    console.log("Submitting file to IPFS...");

    ipfs.add(this.state.buffer,(error,result)=>{
      if(error)
      {
          alert("Error in uploading");
      }
      else
      {
        console.log("ipfs hash",result);
        this.setState({loading:true});
    this.state.decentragram.methods.uploadImage(result[0].hash,description).send({from:this.state.account}).on('transactionHash', (hash) => {
      this.setState({ loading: false });
    });
      }
    });
    

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      decentragram: null,
      images: [],
      loading: true,
      imagescount:0,
      buffer:''
    }

    
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              tipImageOwner={this.tipImageOwner}
            />
        }
      </div>
    );
  }
}

export default App;

import './App.css';

import React from 'react';
import abi from './contract/abi/VRDF20_abi.json';
import getWeb3 from './web3';
import identicon from 'identicon';

const DEPLOYED_ADDRESS = "0x34E0BB6396dE68521f2e6adA01BEF6f950B5f2bd";


class App extends React.Component {

  state = { storageValue: 0, web3: null, accounts: null, contract: null, house: "", open: false };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
     
      if(networkId !== 42){
        alert("Please make sure to switch you network to Kovan Testnet")
      }
      const instance = new web3.eth.Contract(
        abi,
        DEPLOYED_ADDRESS,
      );
     
      this.setState({ web3, accounts, contract: instance }, this.getHouse);

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
    this.getIdenticon()
  };

  getHouse = async () => {
    const { contract, accounts } = this.state
    let house = await contract.methods.house(accounts[0]).call();
    this.setState({
      house
    })
    
  }

  getIdenticon = () => {

    const {accounts} = this.state

    accounts && identicon.generate({ id: accounts[0], size: 150 }, (err, buffer) => {
      if (err) throw err
      const img = new Image()
      img.src = buffer
      document.getElementById('identicon').innerHTML = "";
      document.getElementById('identicon').appendChild(img)
  })
  }

  rollDie = async () => {
    const { contract, accounts} = this.state;
    try {
      await contract.methods.rollDice(accounts[0]).send({
        from: accounts[0]
      }).then(function(res) {
          console.log(res)
      })
    } catch (err) {
      if(err.code === 4001){
        alert("Please Accept the Txn for fee to be paid. It's on Kovan testnet.")
      }
    }
    
  }


  openLink = (link) => {
    window.open(link);
  }

  render() {

    const {house, accounts, open} = this.state;

    return (
      <div className="container">
        <nav className="navbar" role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a className="navbar-item" href="#">
              <img src="logo.png" alt="VRF House (GOT)" />
              <h5 className="title is-4">DHouse</h5>
            </a>

            <div role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" onClick={() => this.setState({open: !open})}>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </div>
          </div>
          <div className={`navbar-menu navbar-end mt-2 mb-3 ${open && "is-active"}`}>
            <button className="button is-primary mt-2 ml-6" onClick={() => this.openLink(`https://kovan.etherscan.io/address/${DEPLOYED_ADDRESS}`)}>Show Contract on Kovan</button>
          </div>
        </nav>
        <div className="container">
          <p>
            This contract uses Chainlink VRF's to get Verifiable Random Houses for your address. Do look into the contract txns. for more. 
          </p>
          <a className="link" href="https://docs.chain.link/docs/chainlink-vrf/">Learn more.</a>
        </div>
        <div className="card mt-4 mb-4">
          {(house !== "") && <div className="card-image">
            <figure className="image">
              <img src={`/houses/${house.toLowerCase()}.png`} alt="House Logo" className="image"/>
            </figure>
          </div>}
          <div className="card-content">
          <div className="media">
            <div className="media-left">
              <figure className="image is-48x48" id="identicon">
                <img src="https://bulma.io/images/placeholders/96x96.png" alt="Identicon" />
              </figure>
            </div>
            <div className="media-content">
              <p className="is-6">{accounts && accounts[0]}</p>
            </div>
          </div>

          <div className="content">
            {(house !== "") ? `Your 🏠 is ${house}` : "Not yet selected. Go Ahead and Try this contract to get your House."}
            <br />
            {
              (house === "") &&
              <button className="button is-primary" onClick={this.rollDie}>Get your House</button>
            }
          </div>
        </div>
        </div>
        <footer class="footer">
          <div class="content has-text-centered">
            <p>
              <strong>Dhouse</strong> by <a href="https://prix.vercel.app" target="_blank">Prince Anuragi</a>. View it on 
              <a href="https://github.com/prix0007/DHouse" target="_blank">Github</a>.
            </p>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;

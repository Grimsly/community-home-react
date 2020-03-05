import React from 'react';
import ReactModal from 'react-modal'
import './App.scss';

ReactModal.setAppElement('#root');

class App extends React.Component {

	currentCommunity = {};
	currentHouses = [];

  constructor(props){
    super(props);
    this.state= {
      error: null,
      isLoaded: false,
      communities: [],
      houses: new Map(),
			modalOpen: false,
			currentCommunity: {},
			currentHouses: []
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal(){
    this.setState({modalOpen: true});
  }

  handleCloseModal(){
		this.setState({modalOpen: false});
	}
	
	updateModal(community, houses){
		this.currentCommunity = community
		this.currentHouses = houses
		console.log(this.currentCommunity);
		this.handleOpenModal();
	}

  componentDidMount() {
    fetch("https://a18fda49-215e-47d1-9dc6-c6136a04a33a.mock.pstmn.io/communities")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            communities: result
          });
          fetch("https://a18fda49-215e-47d1-9dc6-c6136a04a33a.mock.pstmn.io/homes")
            .then(res => res.json())
            .then(
              (result) => {
                this.setState({
                  isLoaded: true,
                  houses: sortHouses(result)
                });
                
              },
              (error) => {
                this.setState({
                  isLoaded: true,
                  error
                });
              }
            )
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
	}
	
	createCommunity(community, houses){
		const averagePrice = getAveragePrice(houses);
	
		return (
			<div key={community.id} className="community" style={{backgroundImage: "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(" + community.imgUrl + ")"}} onClick={this.updateModal.bind(this, community, houses)}>
				<div className="description">
					<h2>{community.name}</h2>
					{(() => {
						if (averagePrice.houseFound === true){
							if (averagePrice.lowest === averagePrice.highest){
								return <p>${averagePrice.lowest}</p>
							}else{
								return <p>${averagePrice.lowest} - ${averagePrice.highest}</p>
							}
						}else{
							return <p>Prices Not Available</p>
						}
					})()}
				</div>
			</div>
		)
	}

  render() {
    const{ error, isLoaded, communities, houses} = this.state;
    console.log(houses)
    communities.sort(function(a, b){
      if (a.name > b.name){
        return 1;
      }else{
        return -1;
      }
    })

    if (error){
      return <div>Error: {error.message}</div>
    }else if (!isLoaded){
      return <div>Loading...</div>
    }else{
      return(
        <div className="App">
          <h1>Communities</h1>
          <div id="communities">
            {communities.map(community => (
              this.createCommunity(community, houses.get(community.id))
            ))}
          </div>

	
				<ReactModal
					isOpen={this.state.modalOpen}
					contentLabel="onRequestClose houseList"
					onRequestClose={this.handleCloseModal}
					className="CommunitySpecifics"
					overlayClassName="Background"
				>
					<button onClick={this.handleCloseModal}>Close Modal</button>

					<h1>{this.currentCommunity.name}</h1>
					<table class="HouseList">
						<thead>
							<tr key="header">
								<th>Type</th>
								<th>Area</th>
								<th>Price</th>
							</tr>
						</thead>
						<tbody>
							{this.currentHouses.map(house => (
								<tr key={house.id}>
									<td>{house.type}</td>
									<td>{house.area}</td>
									<td>${house.price}</td>
								</tr>
							))}
						</tbody>
					</table>
				</ReactModal>  
        </div>
      )
    }
	}
}

function getAveragePrice(houses){
    console.log(houses)
    if (houses === undefined){
      return {houseFound: false, lowest: 0, highest: 0};
    }
    let lowestPrice;
    let highestPrice;
    for (let index = 0; index < houses.length; index++){
      if (index === 0){
        lowestPrice = houses[0].price;
        highestPrice = houses[0].price;
      }else{
        if (lowestPrice > houses[index].price){
          lowestPrice = houses[index].price;
        }else if (highestPrice < houses[index].price){
          highestPrice = houses[index].price;
        }
      }
    }

    return {houseFound: true, lowest: lowestPrice, highest: highestPrice};
}

function sortHouses(houses){
  let map = new Map();
  for (let house of houses){
    if (map.has(house.communityId)){
      map.get(house.communityId).push(house);
    }else{
      map.set(house.communityId, [house]);
    }
  }

  return map;
}

export default App;

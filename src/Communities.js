import React from 'react';
import ReactModal from 'react-modal'
import './Communities.scss';

ReactModal.setAppElement('#root');

class Communities extends React.Component {

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
	
	// When a community is pressed, make sure that the modal window's information correlates to the community.
	// Updates the app as to what community was pressed on.
	// Opens the Modal Window after updating
	updateModal(community, houses){
		this.currentCommunity = community
		this.currentHouses = houses
		this.handleOpenModal();
	}

  componentDidMount() {
		// Fetch the communites from the API
    fetch("https://a18fda49-215e-47d1-9dc6-c6136a04a33a.mock.pstmn.io/communities")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            communities: result
					});
					
					// If the GET from the previous fetch was a success, perform another fetch, this time for the houses.
          fetch("https://a18fda49-215e-47d1-9dc6-c6136a04a33a.mock.pstmn.io/homes")
            .then(res => res.json())
            .then(
              (result) => {
                this.setState({
									// Set the state of the app to be loaded
                  isLoaded: true,
                  houses: sortHouses(result)
                });
                
              },
              (error) => {
                this.setState({
                  isLoaded: true,
                  error: error
                });
              }
            )
				},
				// Return the error if there was one
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      )
	}
	
	// Creates and return communities in HTML format
	// When any of the communitees are clicked or pressed on, a modal window will appear to show the listed houses.
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
		
		// Sort the communites alphabetically
		// This assumes that the community names are consistent with cases
    communities.sort(function(a, b){
      if (a.name > b.name){
        return 1;
      }else{
        return -1;
      }
    })

		// If an error occured while fetching the API, then the error will be printed
		// If the fetch is still performing the GET, show a loading screen
		// When done loading, form the body of the app
    if (error){
      return <div className="Communities">Error: {error.message}</div>
    }else if (!isLoaded){
      return <div id="loading" className="Communities">Loading...</div>
    }else{
      return(
        <div className="Communities">
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
					<button className="closeButton" onClick={this.handleCloseModal}>X</button>

					<h1>{this.currentCommunity.name}</h1>
					{checkHousesExist(this.currentHouses)}
					
				</ReactModal>  
        </div>
      )
    }
	}
}

// Checks if the community has houses
// If it does, then create a list of houses and return the elements
// If not, then give notice that there are no houses.
function checkHousesExist(houses){
	if (houses){
		return(
			<table className="HouseList">
				<thead>
					<tr key="header">
						<th>Type</th>
						<th>Area</th>
						<th>Price</th>
					</tr>
				</thead>
				<tbody>
					{houses.map(house => (
						<tr key={house.id}>
							<td>{house.type}</td>
							<td>{house.area}</td>
							<td>${house.price}</td>
						</tr>
					))}
				</tbody>
			</table>
		)
	}else{
		return 	(<div>No houses available</div>)
	}
}

// From an array of houses, find the lowest price and the highest
// If the argument passed in is an undefined, it means that the community has no houses, so return a boolean for notification
function getAveragePrice(houses){
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

// Sorts the houses by using the community ID
// Creates a map that uses the community ID as the key
// Each key's value is an array of houses
// Returns the map
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

export default Communities;

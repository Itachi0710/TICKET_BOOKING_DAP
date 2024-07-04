import Web3 from 'web3'; // Import Web3 library
import configuration from '../build/contracts/Tickets.json'; // Import compiled contract ABI and network details
import 'bootstrap/dist/css/bootstrap.css'; // Import Bootstrap CSS
import ticketImage from './images/ticket.png'; // Import ticket image

// Function to create DOM element from HTML string
const createElementFromString = (string) => {
  const el = document.createElement('div');
  el.innerHTML = string;
  return el.firstChild;
};

// Contract configuration from compiled JSON file
const CONTRACT_ADDRESS = configuration.networks['5777'].address; // Adjust based on your network ID
const CONTRACT_ABI = configuration.abi; // ABI of your smart contract

// Initialize Web3 with the Ethereum provider (MetaMask or local Ganache)
const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545'); // Update with your correct provider URL if needed
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let account; // Variable to store current user's Ethereum account address

// DOM elements
const accountEl = document.getElementById('account'); // Element to display user's Ethereum account
const ticketsEl = document.getElementById('tickets'); // Container for displaying tickets
const TOTAL_TICKETS = 10; // Total number of tickets available
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'; // Ethereum empty address

// Function to handle buying a ticket
const buyTicket = async (ticket) => {
  try {
    console.log('Buying ticket:', ticket); // Log the ticket being purchased
    const ticketPriceInWei = web3.utils.toWei(ticket.price.toString(), 'wei'); // Convert ticket price to Wei
    const transaction = await contract.methods.buyTicket(ticket.id).send({ from: account, value: ticketPriceInWei }); // Send transaction to buy ticket
    console.log('Transaction details:', transaction);
    console.log('Ticket purchased:', ticket);
    await refreshTickets(); // Optionally refresh tickets list after purchase
  } catch (error) {
    console.error('Error buying ticket:', error);
  }
};

// Function to refresh and display tickets
const refreshTickets = async () => {
  ticketsEl.innerHTML = ''; // Clear existing tickets
  for (let i = 0; i < TOTAL_TICKETS; i++) {
    try {
      console.log('Retrieving ticket:', i); // Log the index of the ticket being retrieved
      const ticket = await contract.methods.tickets(i).call(); // Get ticket details from smart contract
      console.log('Retrieved ticket:', ticket);
      if (ticket.owner === EMPTY_ADDRESS) {
        const ticketPriceInEther = web3.utils.fromWei(ticket.price.toString(), 'ether'); // Convert ticket price to Ether
        const ticketEl = createElementFromString(
          `<div class="ticket card" style="width: 18rem;">
            <img src="${ticketImage}" class="card-img-top" alt="Ticket">
            <div class="card-body">
              <h5 class="card-title">Ticket</h5>
              <p class="card-text">${ticketPriceInEther} Eth</p> <!-- Display converted value -->
              <button class="btn btn-primary">Buy Ticket</button>
            </div>
          </div>`
        );
        ticketEl.querySelector('button').onclick = () => buyTicket({ id: i, price: ticket.price }); // Attach buyTicket function to button click
        ticketsEl.appendChild(ticketEl); // Append ticket element to tickets container
      }
    } catch (error) {
      console.error('Error retrieving ticket:', error);
    }
  }
};

// Main function to initialize the application
const main = async () => {
  if (window.ethereum) { // Check if Ethereum provider (like MetaMask) is available
    try {
      // Request account access from user
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        account = accounts[0]; // Set current account to the first account in the array
        accountEl.innerText = account; // Display account address in the DOM
        await refreshTickets(); // Refresh and display tickets
      } else {
        console.log("No Ethereum accounts available");
      }
    } catch (error) {
      console.error("Error connecting to Ethereum provider:", error);
    }
  } else {
    console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
  }
};

main(); // Initialize the application when the script is loaded

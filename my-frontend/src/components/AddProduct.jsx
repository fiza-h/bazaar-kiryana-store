import React, { Component } from 'react';

class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
          ProductName: '',
          Category: '',
          Qty: '',
          Price: '',
        };
      }
    
      handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
      };
    
      handleSubmit = (e) => {
        e.preventDefault();
        // Handle product form submission logic here
        console.log('Product Name:', this.state.ProductName);
        console.log('Category:', this.state.Category);
        console.log('Quantity:', this.state.Qty);
        console.log('Price:', this.state.Price);
      };
    
      render() {
        return (
          <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
            <legend className="fieldset-legend">Add Product</legend>
            
            <form onSubmit={this.handleSubmit}>
              <label className="fieldset-label">Product Name</label>
              <input
                type="text"
                name="ProductName"
                className="input"
                placeholder="Product Name"
                value={this.state.ProductName}
                onChange={this.handleInputChange}
                required
              />
              
              <label className="fieldset-label">Category</label>
              <input
                type="text"
                name="Category"
                className="input"
                placeholder="Category"
                value={this.state.Category}
                onChange={this.handleInputChange}
                required
              />
              
              <label className="fieldset-label">Quantity</label>
              <input
                type="number"
                name="Qty"
                className="input"
                placeholder="Quantity"
                value={this.state.Qty}
                onChange={this.handleInputChange}
                required
              />
              
              <label className="fieldset-label">Price</label>
              <input
                type="number"
                name="Price"
                className="input"
                placeholder="Price"
                value={this.state.Price}
                onChange={this.handleInputChange}
                required
              />
              
              <button type="submit" className="btn btn-neutral mt-4">Add Product</button>
            <button className="btn btn-neutral mt-4">Cancel</button>
            </form>
          </fieldset>
        );
      }
    }

export default AddProduct;

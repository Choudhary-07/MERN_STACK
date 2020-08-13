import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../auth/helper";
import { cartEmpty, loadCart } from "./helper/cartHelper";
import { createOrder } from "./helper/orderHelper";
import { Link } from "react-router-dom";
import StripeCheckoutButton from "react-stripe-checkout";
import { API } from "../backend";

const StripeCheckout = ({
  products,
  setReload = f => f,
  reload = undefined
}) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    error: "",
    address: ""
  });

  const token = isAuthenticated() && isAuthenticated().token;
  const userId = isAuthenticated() && isAuthenticated().user._id;

  const getFinalAmount = () => {
    let amount = 0;
    products.map(p => {
      amount = amount + p.price;
    });
    return amount;
  };

  const makePayment = token => {
    const body = {
        token,
        products
    }
    const headers = {
        "Content-Type" : "application/json"
    }
    return fetch(`${API}/stripepayment` , {
        method: "POST",
        headers,
        body:JSON.stringify(body)
    }).then( res => {
        console.log(res);

        const{status} = res;

        const orderData = {
            products: products,
            transaction_id : res.transaction_id,
            amount: res.transaction_amount,
            
        };

        createOrder(userId,token, orderData)

        cartEmpty( ()=> {
            console.log("DID WE GOT A CRASH?")
        })
        setReload(!reload);
    }).catch(error => console.log(error))
  };

  const showStripeButton = () => {
    return isAuthenticated() ? (
      <StripeCheckoutButton
        stripeKey="pk_test_51HFDLxBazMTXFcAZRoUS4THUzwo8AtCyD3FL7R7nCsTYOOjyzdYBbSKz3rcMKCaJtU7EheMOfDGUIweyU4YvftNX00sqHCrTxT"
        token={makePayment}
        amount={getFinalAmount() * 100}
        name="Buy Tshirts"
        shippingAddress
        billingAddress
      >
        <button className="btn btn-success">Pay with stripe</button>
      </StripeCheckoutButton>
    ) : (
      <Link to="/signin">
        <button className="btn btn-warning">Signin</button>
      </Link>
    );
  };

  return (
    <div>
      <h3 className="text-white">Stripe Checkout {getFinalAmount()}</h3>
      {showStripeButton()}
    </div>
  );
};

export default StripeCheckout;

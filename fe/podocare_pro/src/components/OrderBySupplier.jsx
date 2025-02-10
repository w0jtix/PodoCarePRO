import React from 'react'

const OrderBySupplier = () => {
  return (
    <div className='order-display-container'>
      <div className='order-display-interior'>
            <h1>Wybierz sklep by zobaczyć zamówienia</h1>
            <button className='order-add-new-product-button'>
                <img 
                    src='src/assets/addNew.svg' 
                    alt="add new" 
                    className='add-new-icon' />
                <a>Dodaj produkt</a>
            </button>
            <div className='order-productList'>
                
            </div>
            <div className='order-shipping'>
                <a>Koszt przesyłki:</a>
            </div>
            <div className='order-cost-summary'>
                <a>Total:</a>
            </div>
            <button className='order-confirm-button'>
                <h1>Zatwierdź</h1>
            </button>
        </div>
    </div>
  )
}

export default OrderBySupplier

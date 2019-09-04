const { loadAllItems, loadPromotions } = require('./datbase');
function getInputList(inputs) {
    return inputs.map(item => {
        const item_temp = item.split('\-');
        return (item_temp.length === 1) ? {barcode: item, quantity: 1} :
            (item_temp.length === 2) ? {barcode: item_temp[0], quantity: item_temp[1]} : {barcode: null, quantity: 0};
    });
}

function getShoppingList(inputList) {
    const allItems = loadAllItems();
    const shoppingList = [];
    inputList.forEach(item => {
        let it = shoppingList.find(sl => sl.barcode === item.barcode);
        if (it)
            it.quantity++;
        else {
            shoppingList.push({
                ...allItems.find(i => i.barcode === item.barcode),
                quantity: item.quantity,
            })
        }
    });
    return shoppingList;
}

function getPromotionList(shoppingList) {
    const allItems = loadAllItems();
    const promotions = loadPromotions().find(it => it.type === 'BUY_TWO_GET_ONE_FREE').barcodes;
    const promotionList = [];
    shoppingList.forEach(item => {
        if (promotions.find((promotion => promotion === item.barcode)) && item.quantity >= 2) {
            promotionList.push({
                ...allItems.find(i => i.barcode === item.barcode),
                quantity: 1,
            });
        }
    });
    return promotionList;
}

module.exports = function printInventory(inputs) {
    const inputList = getInputList(inputs);
    const shoppingList = getShoppingList(inputList);
    const promotionList = getPromotionList(shoppingList);
    console.log(`***<没钱赚商店>购物清单***
${shoppingList
        .map(str => `名称：${str.name}，数量：${str.quantity}${str.unit}，单价：${str.price.toFixed(2)}(元)，小计：${(str.quantity * str.price - (promotionList
            .find(pro => pro.barcode === str.barcode) ? promotionList.find(pro => pro.barcode === str.barcode).price : 0))
            .toFixed(2)}(元)`).join('\n')}
----------------------
挥泪赠送商品：
${promotionList.map(str => `名称：${str.name}，数量：${str.quantity}${str.unit}`).join('\n')}
----------------------
总计：${(shoppingList.map(sl => sl.quantity * sl.price).reduce((pre, cur) => pre + cur) -
        promotionList.map(pl => pl.quantity * pl.price).reduce((pre, cur) => pre + cur)).toFixed(2)}(元)
节省：${promotionList.map(pl => pl.quantity * pl.price).reduce((pre, cur) => pre + cur).toFixed(2)}(元)
**********************`);
};

<?php
  $page_title = 'Home Page';
  require_once('includes/load.php');
  if (!$session->isUserLoggedIn(true)) { redirect('index.php', false);}
  if (!isset($_SESSION["orderid"])) {
    $_SESSION["orderid"]=rand();
  }
  $total_order = 0;
?>
<?php include_once('layouts/header.php'); ?>
<?php
/*if(!isset($cart)){
  $get_cart_query  = "SELECT * from cart WHERE order_id = '{$_SESSION["orderid"]}'";
  $cart_items = $db->query($get_cart_query);
  while($row = $cart_items->fetch_assoc()){
    $cart[] = $row;
  }
}*/
$result;
if (isset($_POST['submit_code']) and !empty($_POST['product-barcode'])) {
  $barcode = remove_junk($db->escape($_POST['product-barcode']));
  $query  = "SELECT * FROM products WHERE barcode = '{$barcode}' LIMIT 1";
  $session_id = $_SESSION["orderid"];
  $result = $db->query($query);
  while($row = $result->fetch_assoc()){
    $scanned_item = $row;
  }
  $exist_query = "SELECT * FROM cart WHERE barcode = '{$barcode}' AND order_id='{$session_id}' LIMIT 1";
  $check_exist = $db->query($exist_query);
  
  If($check_exist->num_rows > 0){
    //update items to cart
    
    foreach ($check_exist as $item):
      $item_id = remove_junk($item['id']);
      if (remove_junk($scanned_item['quantity']) >remove_junk($item['quantity'])) {
        $p_qty   = remove_junk($item['quantity'])+1;
        $cart_query  = "UPDATE cart SET quantity = '{$p_qty}' WHERE id = '{$item_id}'";

        if($result = $db->query($cart_query)){
          $session->msg('s',"Product updated ");
        } else {
            $session->msg('d',' Sorry failed to update!');
        }
      }
      
      
    endforeach;
  }else{
    //add scanned item to cart
    foreach ($result as $item):
        $barcode = remove_junk($item['barcode']);
        $p_name  = remove_junk($item['name']);
        if (remove_junk($scanned_item['quantity']) >=1) {
        $p_qty   = remove_junk(1);
        $p_sale  = remove_junk($item['sale_price']);
        $p_id = remove_junk($item['id']);
        
        $cart_query  = "INSERT INTO cart (";
        $cart_query .=" name,quantity,price,barcode,order_id,product_id";
        $cart_query .=") VALUES (";
        $cart_query .=" '{$p_name}', '{$p_qty}','{$p_sale}', '{$barcode}','{$session_id}','{$p_id}'";
        $cart_query .=")";
        if($result = $db->query($cart_query)){
            $session->msg('s',"Product added ");
        } else {
            $session->msg('d',' Sorry failed to added!');
        }
      }
      endforeach;
    }
  
   
  // refresh cart items
  $get_cart_query  = "SELECT * from cart WHERE order_id = '{$_SESSION["orderid"]}'";
  $cart_items = $db->query($get_cart_query);
  while($row = $cart_items->fetch_assoc()){
    $cart[] = $row;
    $total_order += $row['quantity'] * $row['price'];
  }
  
}
if (isset($_POST['buy'])) {
  $cash =  remove_junk($_POST["cash_value"]);
  $get_cart_query  = "SELECT * from cart WHERE order_id = '{$_SESSION["orderid"]}'";
  $cart_items = $db->query($get_cart_query);
  $order_id =$_SESSION["orderid"];
  
  
 
  foreach ($cart_items as $item):
    $p_name  = remove_junk($item['name']);
    $p_qty   = remove_junk($item['quantity']);
    $p_sale  = remove_junk($item['price']);
    $p_id = remove_junk($item['product_id']);
    $date = make_date();
    $barcode = remove_junk($item['barcode']);

    $cart_query  = "INSERT INTO sales (";
    $cart_query .=" product_id,qty,price,date";
    $cart_query .=") VALUES (";
    $cart_query .=" '{$p_id}','{$p_qty}','{$p_sale}','{$date}'";
    $cart_query .=")";
    if($result = $db->query($cart_query)){
      $search_query  = "SELECT * FROM products WHERE barcode = '{$barcode}' LIMIT 1";
      $search_result = $db->query($search_query);
      while($search_row = $search_result->fetch_assoc()){
        $search_item = $search_row;
      }
      $search_qty = remove_junk($search_item['quantity']) - $p_qty;
      $search_id = remove_junk($search_item['id']);
      $product_query  = "UPDATE products SET quantity = '{$search_qty}' WHERE id = '{$search_id}'";
        if($product_result = $db->query($product_query)){
          $session->msg('s',"Product updated ");
        } else {
            $session->msg('d',' Sorry failed to update!');
        }
      $session->msg('s',"Product added ");
    } else {
        $session->msg('d',' Sorry failed to added!');
    }
  
  endforeach;
  
  unset($_SESSION["orderid"]);
  $_SESSION["orderid"]=rand();
  Header("Location:receipt.php?order_id=".$order_id."&cash=".$cash);
}

if (isset($_POST["delete_item"])) {
  $cart_id = remove_junk($db->escape($_POST['cart_id']));
  $delete_query = "DELETE FROM cart WHERE id ='{$cart_id}'";
  if($delete_result = $db->query($delete_query)){
    $session->msg('s',"cart item deleted ");
  } else {
      $session->msg('d',' Sorry failed to delete!');
  }
  $get_cart_query  = "SELECT * from cart WHERE order_id = '{$_SESSION["orderid"]}'";
  $cart_items = $db->query($get_cart_query);
  while($row = $cart_items->fetch_assoc()){
    $cart[] = $row;
  }
}


?>
<div class="row">
  
  <form  id="Form" action="buy_product.php" method="post" >
    <div style="display:flex;justify-content: end;flex-direction:row; padding-bottom:1em;">
      <input  style="visibility:hidden"  type="submit" id="submit_code" name="submit_code" value="Submit" class="btn">  
      <input style="width: 15em;" type="text" class="form-control" id="product-barcode" name="product-barcode" placeholder="product-barcode" autofocus  />
    </div>
  </form> 
  
  
 <div class="panel">
    <div style="overflow-y:auto; height: 35rem">
    <table class="table">
      <thead class="thead-dark">
        <tr style="background: gray;top: 0; position:sticky;">
          <th style="position: sticky;top: 0;color:white;">Product Name</th>
          <th style="position: sticky;top: 0;color:white;">Price</th>
          <th style="position: sticky;top: 0;color:white;">Quantity</th>
          <th style="position: sticky;top: 0;color:white;">Total Price</th>
          <th style="position: sticky;top: 0;color:white; width: 50px">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php 
        if (isset($cart)) {
         
        
        foreach ($cart as $product):?>
        <tr>
          <td ><?php echo remove_junk($product['name']); ?></td>
          <td ><?php echo remove_junk($product['price']); ?></td>
          <td ><?php echo remove_junk($product['quantity']); ?></td>
          <td ><?php echo remove_junk($product['quantity']) * remove_junk($product['price']); ?></td>
          <td >
          <form action="buy_product.php" method="post" >
            <input type="hidden" value="<?php echo remove_junk($product['id']); ?>" name="cart_id" id="cart_id">
             <button type="submit" name="delete_item" id="delete_item" class="fabutton">
                <i class="fa fa-trash text-danger"></i>
             </button>
            </form>
          </td>
        </tr>
        <?php endforeach;
      } ?>
      </tbody>
      
    </table>
    
  
 </div>
 <form name="buyform"method="post" action="buy_product.php">
 <div style="display:flex; justify-content: end; flex-direction:row; padding-right:1em;">
    <b class="h4" style="padding-right:1em">Cash : </b>
    <input  type="number" class="form-control"  style="width: 15em;margin-right:1em;" placeholder="0" name="cash_value" id="cash_value" >
    <b class="h4" style="padding-right:1em">Total : </b>
    <input type="number" class="form-control"  style="width: 15em;padding-right:1em;" readonly name="total" value="<?php echo remove_junk($total_order); ?>" id="getTotal" /></div>
  </div>
 <div style="display:flex;justify-content: end;">
      <button value="Buy" name="buy" id="buy" class="btn btn-primary">Buy</button>
    
  </div>
</form>
</div>

<?php include_once('layouts/footer.php'); ?>
<script>
$("#product-barcode").keypress(function(event){
  if(event.key ==="Enter"){
    event.preventDefault();
    $('#submit_code').click();
  }
})

</script>

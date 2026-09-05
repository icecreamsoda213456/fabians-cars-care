<?php
$page_title = 'All Product';
require_once('includes/load.php');
// Check what level user has permission to view this page
page_require_level(2);
$products = join_product_table();

// Handle search
if (isset($_POST['search'])) {
  $search = $_POST['search'];
  $products = search_products($search);
}
?>
<?php include_once('layouts/header.php'); ?>
<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <?php echo display_msg($msg); ?>
    </div>
    <div class="col-md-12">
      <div class="panel panel-default">
        <div class="panel-heading clearfix">
          <div class="pull-left">
            <form method="post" action="product.php" class="form-inline">
              <div class="form-group">
                <input type="text" class="form-control" name="search" placeholder="Search products, barcode, category" value="<?php echo isset($search) ? remove_junk($search) : ''; ?>">
              </div>
              <button type="submit" class="btn btn-info">Search</button>
              <a href="product.php" class="btn btn-default">Reset</a>
            </form>
          </div>
          <div class="pull-right">
            <a href="add_product.php" class="btn btn-primary">Add New</a>
          </div>
        </div>
        <div class="panel-body">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th class="text-center" style="width: 50px;">#</th>
                <th> Photo</th>
                <th> Product Title </th>
                <th class="text-center" style="width: 10%;"> Categorie </th>
                <th class="text-center" style="width: 10%;"> Instock </th>
                <th class="text-center" style="width: 10%;"> Saleing Price </th>
                <th class="text-center" style="width: 10%;"> Product Added </th>
                <th class="text-center" style="width: 100px;"> Actions </th>
                <th class="text-center" style="width: 10%;"> Barcode </th>
              </tr>
            </thead>
            <tbody>
            <?php foreach ($products as $product): ?>
              <?php $low_stock_class = ((int)$product['quantity'] <= 3) ? 'danger' : ''; ?>
              <tr class="<?php echo $low_stock_class; ?>">
                <td class="text-center"><?php echo count_id(); ?></td>
                <td>
                  <?php if ($product['media_id'] === '0'): ?>
                    <img class="img-avatar img-circle" src="uploads/products/no_image.jpg" alt="" width="250" height="250">
                  <?php else: ?>
                    <img class="img-avatar img-circle" src="uploads/products/<?php echo $product['image']; ?>" alt="" width="250" height="250">
                  <?php endif; ?>
                </td>
                <td> <?php echo remove_junk($product['name']); ?></td>
                <td class="text-center"> <?php echo remove_junk($product['categorie']); ?></td>
                <td class="text-center"> <?php echo remove_junk($product['quantity']); ?></td>
                <td class="text-center"> <?php echo remove_junk($product['sale_price']); ?></td>
                <td class="text-center"> <?php echo read_date($product['date']); ?></td>
                <td class="text-center">
                  <div class="btn-group">
                    <a href="edit_product.php?id=<?php echo (int)$product['id']; ?>" class="btn btn-info btn-xs" title="Edit" data-toggle="tooltip">
                      <span class="glyphicon glyphicon-edit"></span>
                    </a>
                    <a href="delete_product.php?id=<?php echo (int)$product['id']; ?>" class="btn btn-danger btn-xs" title="Delete" data-toggle="tooltip">
                      <span class="glyphicon glyphicon-trash"></span>
                    </a>
                  </div>
                </td>
                <td class="text-center"> <?php echo ($product['barcode']); ?></td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
<?php include_once('layouts/footer.php'); ?>

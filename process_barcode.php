<?php
// Connect to the database and define the find_product_by_barcode function
require_once('includes/load.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['barcode'])) {
    $barcode = $db->escape($_POST['barcode']);
    $product = find_by_barcode($barcode);

    if ($product) {
        // Return product details as JSON
        header('Content-Type: application/json');
        echo json_encode($product);
    } else {
        // Return error message as JSON
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Product not found']);
    }
}
?>

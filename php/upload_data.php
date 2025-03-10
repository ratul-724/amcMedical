<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Connect to MySQL
$conn = new mysqli('localhost', 'root', '', 'ams_medical');

if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Connection failed: ' . $conn->connect_error]));
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid JSON format']);
        exit;
    }

    $duplicateIds = [];
    $successCount = 0;

    foreach ($data as $row) {
        // 🔹 Check if ID already exists
        $checkStmt = $conn->prepare('SELECT id FROM ams_medical WHERE id = ?');
        $checkStmt->bind_param('i', $row['id']);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            // ❌ If duplicate, store it in array
            $duplicateIds[] = $row['id'];
            $checkStmt->close();
            continue;
        }
        $checkStmt->close();

        // ✅ Insert new data
        $stmt = $conn->prepare('INSERT INTO ams_medical (id, medical_name, date, name, passport, agent, physical, radiology, laboratory, remarks, agent_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->bind_param('issssssssss', 
            $row['id'], 
            $row['medical_name'], 
            $row['date'], 
            $row['name'], 
            $row['passport'], 
            $row['agent'], 
            $row['physical'], 
            $row['radiology'], 
            $row['laboratory'], 
            $row['remarks'], 
            $row['agent_rate']
        );

        if ($stmt->execute()) {
            $successCount++;
        }
        $stmt->close();
    }

    if (count($duplicateIds) > 0) {
        echo json_encode([
            'status' => 'error', 
            'message' => 'Duplicate IDs found: ' . implode(', ', $duplicateIds)
        ]);
    } else {
        echo json_encode([
            'status' => 'success', 
            'message' => "$successCount records inserted successfully"
        ]);
    }
}
?>

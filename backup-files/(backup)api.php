<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(204);
  exit;
}

require_once __DIR__ . "/config.php";
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
  $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
  $conn->set_charset("utf8mb4");

    // ---- ADDRESS SEARCH (no bounds required) ----
    if (isset($_GET["search"]) && trim((string)$_GET["search"]) !== "") {
      $q = trim((string)$_GET["search"]);
    
      $searchLimit = isset($_GET["limit"]) ? (int)$_GET["limit"] : 10;
      if ($searchLimit < 1) $searchLimit = 1;
      if ($searchLimit > 25) $searchLimit = 25;
    
      $like = "%" . $q . "%";
    
      $sql = "
        SELECT
          unique_key,
          address,
          comm_name,
          assessed_value,
          latitude,
          longitude
        FROM calgary_assessments_points
        WHERE address LIKE ?
        ORDER BY assessed_value DESC
        LIMIT ?
      ";
    
      $stmt = $conn->prepare($sql);
      $stmt->bind_param("si", $like, $searchLimit);
      $stmt->execute();
      $result = $stmt->get_result();
    
      $rows = [];
      while ($row = $result->fetch_assoc()) {
        $row["assessed_value"] = $row["assessed_value"] !== null ? (int)$row["assessed_value"] : null;
        $row["latitude"] = (float)$row["latitude"];
        $row["longitude"] = (float)$row["longitude"];
        $rows[] = $row;
      }
    
      echo json_encode([
        "ok" => true,
        "mode" => "search",
        "count" => count($rows),
        "data" => $rows
      ], JSON_UNESCAPED_UNICODE);
      exit;
    }

  // Required bounds
  $minLat = isset($_GET["minLat"]) ? (float)$_GET["minLat"] : null;
  $maxLat = isset($_GET["maxLat"]) ? (float)$_GET["maxLat"] : null;
  $minLng = isset($_GET["minLng"]) ? (float)$_GET["minLng"] : null;
  $maxLng = isset($_GET["maxLng"]) ? (float)$_GET["maxLng"] : null;

  // Zoom controls cluster vs points
  $zoom = isset($_GET["zoom"]) ? (int)$_GET["zoom"] : 11;

  // Optional price filters
  $minValue = isset($_GET["minValue"]) ? (int)$_GET["minValue"] : null;
  $maxValue = isset($_GET["maxValue"]) ? (int)$_GET["maxValue"] : null;

  // Protect server/browser
  $limit = isset($_GET["limit"]) ? (int)$_GET["limit"] : 5000;
  if ($limit < 1) $limit = 1;
  if ($limit > 20000) $limit = 20000;

  if ($minLat === null || $maxLat === null || $minLng === null || $maxLng === null) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Missing required bounds. Provide minLat, maxLat, minLng, maxLng."]);
    exit;
  }

  // Decide mode
  $POINTS_ZOOM_THRESHOLD = 15; // tweak: 14/15/16 depending on UX
  $mode = ($zoom >= $POINTS_ZOOM_THRESHOLD) ? "points" : "clusters";

  // Common WHERE + params
  $where = "
    latitude BETWEEN ? AND ?
    AND longitude BETWEEN ? AND ?
  ";
  $typesBase = "dddd";
  $paramsBase = [$minLat, $maxLat, $minLng, $maxLng];

  if ($minValue !== null) { $where .= " AND assessed_value >= ? "; $typesBase .= "i"; $paramsBase[] = $minValue; }
  if ($maxValue !== null) { $where .= " AND assessed_value <= ? "; $typesBase .= "i"; $paramsBase[] = $maxValue; }

  // ---- POINTS MODE (zoomed in) ----
  if ($mode === "points") {
    $sql = "
      SELECT
        unique_key,
        address,
        assessed_value,
        assessment_class_description,
        comm_name,
        year_of_construction,
        property_type,
        land_size_sf,
        latitude,
        longitude
      FROM calgary_assessments_points
      WHERE $where
      LIMIT ?
    ";

    $types = $typesBase . "i";
    $params = array_merge($paramsBase, [$limit]);

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
      $row["assessed_value"] = $row["assessed_value"] !== null ? (int)$row["assessed_value"] : null;
      $row["year_of_construction"] = $row["year_of_construction"] !== null ? (int)$row["year_of_construction"] : null;
      $row["land_size_sf"] = $row["land_size_sf"] !== null ? (float)$row["land_size_sf"] : null;
      $row["latitude"] = (float)$row["latitude"];
      $row["longitude"] = (float)$row["longitude"];
      $rows[] = $row;
    }

    echo json_encode([
      "ok" => true,
      "mode" => "points",
      "count" => count($rows),
      "data" => $rows
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  // ---- CLUSTERS MODE (one cluster per community) ----
  // Includes: overall average + residential-only average/counts
  $sql = "
    SELECT
      MIN(TRIM(comm_name)) AS comm_name,

      COUNT(*) AS count_all,
      AVG(assessed_value) AS avg_all,

      SUM(CASE WHEN assessment_class_description = 'Residential' THEN 1 ELSE 0 END) AS count_res,
      AVG(CASE WHEN assessment_class_description = 'Residential' THEN assessed_value ELSE NULL END) AS avg_res,

      AVG(latitude) AS latitude,
      AVG(longitude) AS longitude
    FROM calgary_assessments_points
    WHERE $where
      AND comm_name IS NOT NULL
      AND TRIM(comm_name) <> ''
    GROUP BY TRIM(UPPER(comm_name))
    ORDER BY count_all DESC
    LIMIT ?
  ";

  $types = $typesBase . "i";
  $params = array_merge($paramsBase, [$limit]);

  $stmt = $conn->prepare($sql);
  $stmt->bind_param($types, ...$params);
  $stmt->execute();
  $result = $stmt->get_result();

  $rows = [];
  while ($row = $result->fetch_assoc()) {
    $row["count_all"] = (int)$row["count_all"];
    $row["avg_all"] = $row["avg_all"] !== null ? (int)round((float)$row["avg_all"]) : null;

    $row["count_res"] = (int)$row["count_res"];
    $row["avg_res"] = $row["avg_res"] !== null ? (int)round((float)$row["avg_res"]) : null;

    $row["latitude"] = (float)$row["latitude"];
    $row["longitude"] = (float)$row["longitude"];
    $rows[] = $row;
  }

  echo json_encode([
    "ok" => true,
    "mode" => "clusters",
    "cluster_type" => "community",
    "count" => count($rows),
    "data" => $rows
  ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}

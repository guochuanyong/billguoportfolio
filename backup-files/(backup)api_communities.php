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

  // NOTE:
  // - Join key: calgary_assessments_points.comm_name = communities.NAME
  // - "Residential" filter uses assessment_class_description = 'Residential'
  //   (change this string if your column uses a different label/value)
  $sql = "
    SELECT
      c.COMM_CODE,
      c.NAME,
      c.geojson,

      COALESCE(a.count_all, 0) AS count_all,
      a.avg_all,

      COALESCE(a.count_res, 0) AS count_res,
      a.avg_res

    FROM communities c
    LEFT JOIN (
      SELECT
        comm_name,

        COUNT(*) AS count_all,
        AVG(assessed_value) AS avg_all,

        SUM(CASE WHEN assessment_class_description = 'Residential' THEN 1 ELSE 0 END) AS count_res,
        AVG(CASE WHEN assessment_class_description = 'Residential' THEN assessed_value ELSE NULL END) AS avg_res

      FROM calgary_assessments_points
      GROUP BY comm_name
    ) a
      ON a.comm_name = c.NAME
    WHERE c.geojson IS NOT NULL
  ";

  $result = $conn->query($sql);

  $features = [];

  while ($row = $result->fetch_assoc()) {
    $geom = json_decode($row["geojson"], true);
    if (!$geom) continue;

    $features[] = [
      "type" => "Feature",
      "geometry" => $geom,
      "properties" => [
        "COMM_CODE" => $row["COMM_CODE"],
        "NAME" => $row["NAME"],

        // old-style stats
        "count_all" => (int)$row["count_all"],
        "avg_all" => $row["avg_all"] !== null ? (float)$row["avg_all"] : null,

        "count_res" => (int)$row["count_res"],
        "avg_res" => $row["avg_res"] !== null ? (float)$row["avg_res"] : null,
      ],
    ];
  }

  echo json_encode([
    "ok" => true,
    "type" => "FeatureCollection",
    "features" => $features
  ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    "ok" => false,
    "error" => "Server error",
    "details" => $e->getMessage()
  ], JSON_UNESCAPED_UNICODE);
} finally {
  if (isset($conn) && $conn instanceof mysqli) {
    $conn->close();
  }
}
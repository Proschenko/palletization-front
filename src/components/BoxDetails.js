const BoxDetails = ({ box }) => {
    const { width, height, length } = box.dimensions;
    const { x, y, z } = box.position;
  
    const dx = width / 2;
    const dy = height / 2;
    const dz = length / 2;
  
    const corners = [
      { x: x - dx, y: z - dy, z: y - dz },
      { x: x + dx, y: z - dy, z: y - dz },
      { x: x + dx, y: z - dy, z: y + dz },
      { x: x - dx, y: z - dy, z: y + dz },
      { x: x - dx, y: z + dy, z: y - dz },
      { x: x + dx, y: z + dy, z: y - dz },
      { x: x + dx, y: z + dy, z: y + dz },
      { x: x - dx, y: z + dy, z: y + dz },
    ];
  
    return (
      <div>
        <h3>Коробка: {box.article_id}</h3>
        <p>
          <strong>Размеры (Д × Ш × В):</strong> {length} × {width} × {height}
        </p>
        <p>
          <strong>Позиция центра:</strong> ({x}, {z}, {y})
        </p>
        <h4>Координаты углов:</h4>
        <ul style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {corners.map((corner, i) => (
            <li key={i}>
              Угол {i + 1}: ({corner.x.toFixed(2)}, {corner.y.toFixed(2)}, {corner.z.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
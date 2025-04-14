import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Checkbox } from 'antd';
import * as THREE from 'three';

// Компонент карточки с информацией о коробке
const BoxDetailCard = ({ box, layerIndex, onClose }) => {
  const { x, y, z } = box.position;
  const { length, width, height } = box.dimensions;

  const corners = [
    [x, y, z],
    [x + width, y, z],
    [x, y + length, z],
    [x + width, y + length, z],
    [x, y, z + height],
    [x + width, y, z + height],
    [x, y + length, z + height],
    [x + width, y + length, z + height],
  ];

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      right: 10,
      padding: '1rem',
      background: 'white',
      border: '1px solid #ccc',
      maxWidth: 400,
      fontFamily: 'monospace',
      zIndex: 10,
    }}>
      <button onClick={onClose} style={{ float: 'right' }}>X</button>
      <h2>Артикул {box.article_id}</h2>
      <p><strong>Вес: {box.weight_kg} кг</strong></p>
      <p><strong>Вращение: {box.can_rotate ? 'Разрешено' : 'Запрещено'}</strong></p>
      <p><strong>Макс. нагрузка: {box.max_load / 1000} кг</strong></p>
      <h2>Позиция:</h2>
      <p><strong>Слой:</strong> {layerIndex}</p>
      <p><strong>Размеры (Д × Ш × В):</strong> {length} × {width} × {height}</p>
      <p><strong>Углы (8 точек):</strong></p>
      <ul>
        {corners.map(([cx, cy, cz], i) => (
          <li key={i}>({cx.toFixed(2)}, {cy.toFixed(2)}, {cz.toFixed(2)})</li>
        ))}
      </ul>
    </div>
  );
};

// Генерация случайного цвета
const generateRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

// Компонент для отрисовки одной коробки с ребрами
const BoxWithEdges = ({ box, layerIndex, uniqueKey, onClick, color, isSelected }) => {
  const { length, width, height } = box.dimensions;

  const adjustedPosition = [
    box.position.x + width / 2,
    box.position.z + height / 2,
    box.position.y + length / 2,
  ];

  const geometry = new THREE.BoxGeometry(width, height, length);
  const edges = new THREE.EdgesGeometry(geometry);

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: isSelected ? 'red' : 'black',
    linewidth: isSelected ? 10 : 2,
  });

  return (
    <group>
      <mesh
        geometry={geometry}
        material={new THREE.MeshStandardMaterial({ color })}
        position={adjustedPosition}
        onClick={(e) => {
          e.stopPropagation();
          onClick(box, layerIndex, uniqueKey);
        }}
      />
      <lineSegments geometry={edges} material={edgeMaterial} position={adjustedPosition} />
    </group>
  );
};

// Главный компонент визуализации паллет
const PalletVisualizer = ({ pallets, selectedPalletIndex, setSelectedPalletIndex }) => {
  const [selectedBoxData, setSelectedBoxData] = useState(null);
  const [boxColors, setBoxColors] = useState({});
  const [visibleLayers, setVisibleLayers] = useState({}); // Состояние для управления видимостью слоев

  useEffect(() => {
    const newColors = {};
    pallets[selectedPalletIndex]?.layers.forEach(layer => {
      layer.boxes.forEach((box, index) => {
        const key = `${layer.layer_index}_${index}`;
        newColors[key] = generateRandomColor();
      });
    });
    setBoxColors(newColors);

    // Инициализируем видимость слоев (все слои видимы по умолчанию)
    const newVisibleLayers = {};
    pallets[selectedPalletIndex]?.layers.forEach((layer) => {
      newVisibleLayers[layer.layer_index] = true;
    });
    setVisibleLayers(newVisibleLayers);
  }, [pallets, selectedPalletIndex]);

  const handleBoxClick = (box, layerIndex, uniqueKey) => {
    setSelectedBoxData({ ...box, layerIndex, uniqueKey });
  };

  // Функция для обработки изменения состояния видимости слоя
  const handleLayerVisibilityChange = (layerIndex, e) => {
    setVisibleLayers(prevState => ({
      ...prevState,
      [layerIndex]: e.target.checked,
    }));
  };

  return (
    <div style={{ position: 'relative', height: '600px', border: '1px solid #ddd' }}>
      {selectedBoxData && (
        <BoxDetailCard
          box={selectedBoxData}
          layerIndex={selectedBoxData.layerIndex}
          onClose={() => setSelectedBoxData(null)}
        />
      )}
      <div style={{ marginBottom: '10px' }}>
        {pallets[selectedPalletIndex]?.layers.map((layer) => (
          <Checkbox
            key={layer.layer_index}
            checked={visibleLayers[layer.layer_index]}
            onChange={(e) => handleLayerVisibilityChange(layer.layer_index, e)}
          >
            Слой {layer.layer_index}
          </Checkbox>
        ))}
      </div>

      <Canvas camera={{ position: [2000, 2000, 2000], fov: 50, near: 100, far: 5000 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        {pallets[selectedPalletIndex]?.layers.map((layer) => {
          // Пропускаем слой, если он выключен
          if (!visibleLayers[layer.layer_index]) return null;

          return (
            <group key={layer.layer_index}>
              {layer.boxes.map((box, index) => {
                const uniqueKey = `${layer.layer_index}_${index}`;
                const boxColor = boxColors[uniqueKey];
                const isSelected = selectedBoxData && selectedBoxData.uniqueKey === uniqueKey;
                return (
                  <BoxWithEdges
                    key={uniqueKey}
                    box={box}
                    layerIndex={layer.layer_index}
                    uniqueKey={uniqueKey}
                    onClick={handleBoxClick}
                    color={boxColor}
                    isSelected={isSelected}
                  />
                );
              })}
            </group>
          );
        })}
        <mesh position={[500, -25, 600]}>
          <boxGeometry args={[1000, 40, 1200]} />
          <meshStandardMaterial color="brown" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default PalletVisualizer;

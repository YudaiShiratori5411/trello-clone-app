import { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Column, Notification } from '../types';
import ColumnComponent from './Column';
import AddColumnForm from './AddColumnForm.tsx';

interface BoardProps {
  columns: Column[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

function Board({ columns, addNotification }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 新しいリストを追加
  const handleAddColumn = async (title: string) => {
    try {
      await addDoc(collection(db, "columns"), {
        title,
        order: columns.length,
        cards: []
      });
      
      addNotification({
        type: 'success',
        message: 'リストを追加しました'
      });
    } catch (error) {
      console.error("Error adding column: ", error);
      addNotification({
        type: 'error',
        message: 'リストの追加に失敗しました'
      });
    }
  };

  // リストを削除
  const handleDeleteColumn = async (columnId: string) => {
    try {
      await deleteDoc(doc(db, "columns", columnId));
      
      // 残りのリストの順序を更新
      const batch = writeBatch(db);
      columns
        .filter(column => column.id !== columnId)
        .forEach((column, index) => {
          const columnRef = doc(db, "columns", column.id);
          batch.update(columnRef, { order: index });
        });
      
      await batch.commit();
      
      addNotification({
        type: 'success',
        message: 'リストを削除しました'
      });
    } catch (error) {
      console.error("Error deleting column: ", error);
      addNotification({
        type: 'error',
        message: 'リストの削除に失敗しました'
      });
    }
  };

  // カードを追加
  const handleAddCard = async (columnId: string, cardContent: string) => {
    try {
      const columnRef = doc(db, "columns", columnId);
      const column = columns.find(col => col.id === columnId);
      
      if (!column) return;
      
      const newCard = {
        id: Date.now().toString(),
        content: cardContent,
        createdAt: new Date().toISOString(),
        dueDate: null
      };
      
      await updateDoc(columnRef, {
        cards: [...(column.cards || []), newCard]
      });
      
      addNotification({
        type: 'success',
        message: 'カードを追加しました'
      });
    } catch (error) {
      console.error("Error adding card: ", error);
      addNotification({
        type: 'error',
        message: 'カードの追加に失敗しました'
      });
    }
  };

  // カードを削除
  const handleDeleteCard = async (columnId: string, cardId: string) => {
    try {
      const columnRef = doc(db, "columns", columnId);
      const column = columns.find(col => col.id === columnId);
      
      if (!column) return;
      
      await updateDoc(columnRef, {
        cards: column.cards.filter(card => card.id !== cardId)
      });
      
      addNotification({
        type: 'success',
        message: 'カードを削除しました'
      });
    } catch (error) {
      console.error("Error deleting card: ", error);
      addNotification({
        type: 'error',
        message: 'カードの削除に失敗しました'
      });
    }
  };

  // カードの内容を更新
  const handleUpdateCard = async (columnId: string, cardId: string, updatedContent: string, dueDate: string | null) => {
    try {
      const columnRef = doc(db, "columns", columnId);
      const column = columns.find(col => col.id === columnId);
      
      if (!column) return;
      
      const updatedCards = column.cards.map(card => {
        if (card.id === cardId) {
          return { 
            ...card, 
            content: updatedContent,
            dueDate: dueDate
          };
        }
        return card;
      });
      
      await updateDoc(columnRef, { cards: updatedCards });
      
      addNotification({
        type: 'success',
        message: 'カードを更新しました'
      });
    } catch (error) {
      console.error("Error updating card: ", error);
      addNotification({
        type: 'error',
        message: 'カードの更新に失敗しました'
      });
    }
  };

  // DnDでカードをドラッグ開始
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  // DnDでカードをドロップ
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    // カードのドラッグの場合（カードID_カラムID形式）
    if (typeof activeId === 'string' && activeId.includes('_')) {
      const [cardId, sourceColumnId] = activeId.split('_');
      
      // 同じカラム内でのドラッグの場合
      if (overId.includes('_') && overId.split('_')[1] === sourceColumnId) {
        const [overCardId] = overId.split('_');
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        
        if (!sourceColumn) return;
        
        const sourceCards = [...sourceColumn.cards];
        
        const oldIndex = sourceCards.findIndex(card => card.id === cardId);
        const newIndex = sourceCards.findIndex(card => card.id === overCardId);
        
        const updatedCards = arrayMove(sourceCards, oldIndex, newIndex);
        
        await updateDoc(doc(db, "columns", sourceColumnId), {
          cards: updatedCards
        });
      } 
      // 別のカラムへのドラッグの場合
      else if (columns.find(col => col.id === overId)) {
        const targetColumnId = overId;
        const sourceColumn = columns.find(col => col.id === sourceColumnId);
        const targetColumn = columns.find(col => col.id === targetColumnId);
        
        if (!sourceColumn || !targetColumn) return;
        
        const cardToMove = sourceColumn.cards.find(card => card.id === cardId);
        
        if (!cardToMove) return;
        
        const sourceCards = sourceColumn.cards.filter(card => card.id !== cardId);
        const targetCards = [...(targetColumn.cards || []), cardToMove];
        
        const batch = writeBatch(db);
        batch.update(doc(db, "columns", sourceColumnId), { cards: sourceCards });
        batch.update(doc(db, "columns", targetColumnId), { cards: targetCards });
        await batch.commit();
      }
    }
    // リストのドラッグの場合
    else if (columns.find(col => col.id === activeId) && columns.find(col => col.id === overId)) {
      const oldIndex = columns.findIndex(col => col.id === activeId);
      const newIndex = columns.findIndex(col => col.id === overId);
      
      // Firebaseの順序を更新
      const batch = writeBatch(db);
      const reorderedColumns = arrayMove(columns, oldIndex, newIndex);
      
      reorderedColumns.forEach((column, index) => {
        batch.update(doc(db, "columns", column.id), { order: index });
      });
      
      await batch.commit();
    }
    
    setActiveId(null);
  };

  return (
    <div className="board-container">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: 'flex', overflowX: 'auto', padding: '10px' }}>
          {columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              onDeleteColumn={handleDeleteColumn}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
            />
          ))}
          <AddColumnForm onAddColumn={handleAddColumn} />
        </div>
      </DndContext>
    </div>
  );
}

export default Board;
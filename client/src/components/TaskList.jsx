import React from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem.jsx';
import AddTask from './AddTask.jsx';

function SortableTask({ task, ...props }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem task={task} {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function TaskList({ tasks, onAdd, onToggle, onDelete, onEdit, onTimerStart, onTimerStop, onReorder }) {
  const open = tasks.filter(t => !t.completed);
  const done = tasks.filter(t =>  t.completed);
  const pct  = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIdx = open.findIndex(t => t.id === active.id);
    const newIdx = open.findIndex(t => t.id === over.id);
    const newOrder = arrayMove(open, oldIdx, newIdx).map(t => t.id);
    onReorder(newOrder);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Goals & Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs text-zinc-500">{done.length}/{tasks.length} done</span>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-zinc-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      )}

      <AddTask onAdd={onAdd} />

      <div className="flex-1 overflow-y-auto -mr-2 pr-2">
        {open.length === 0 && done.length === 0 && (
          <p className="text-sm text-zinc-600 text-center py-8">No tasks yet. Add one above.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={open.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {open.map(task => (
              <SortableTask key={task.id} task={task}
                onToggle={onToggle} onDelete={onDelete} onEdit={onEdit}
                onTimerStart={onTimerStart} onTimerStop={onTimerStop}
              />
            ))}
          </SortableContext>
        </DndContext>

        {done.length > 0 && (
          <>
            <div className="mt-4 mb-1 flex items-center gap-2">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[11px] text-zinc-600 uppercase tracking-wider">Completed</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            {done.map(task => (
              <TaskItem key={task.id} task={task}
                onToggle={onToggle} onDelete={onDelete} onEdit={onEdit}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

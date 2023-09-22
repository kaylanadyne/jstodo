// todo app 1
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

// menambahkan todo 
function addTodo() {
    // Mendapatkan teks dan timestamp dari input pengguna
    const textTodo = document.getElementById('title').value;
    const timestamp = document.getElementById('date').value;
    // Mencoba untuk menghasilkan ID unik. Namun, fungsi generateID() belum didefinisikan.
    const generatedID = generateID(); 
    // Membuat objek "todo" dengan teks, timestamp, dan status
    const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false); 
    // Menambahkan objek "todo" ke dalam daftar "todos"
    todos.push(todoObject);
    // Memicu event RENDER_EVENT untuk memperbarui tampilan aplikasi
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

// variabel berisi array yang akan menampung beberapa object  
const todos = [];

// mendefinisikan Custom Event dengan nama 'render-todo'
const RENDER_EVENT = 'render-todo';

// berfungsi untuk menghasilkan identitas unik pada setiap item todo
function generateID() {
    return +new Date();
}

document.addEventListener(RENDER_EVENT, function () {

    const uncompletedTODOList = document.getElementById('todos');
    uncompletedTODOList.innerHTML = '';

    const completedTODOList = document.getElementById('completed-todos');
    completedTODOList.innerHTML = '';

    for (const todoItem of todos) {
        const todoElement = makeTodo(todoItem);
        if (!todoItem.isCompleted) 
            uncompletedTODOList.append(todoElement);
        else
            completedTODOList.append(todoElement);
        
    }
});

/* berfungsi untuk membuat object baru dari data yang sudah disediakan dari inputan (parameter function), 
diantaranya id, nama todo (task), waktu (timestamp), dan isCompleted (penanda todo apakah sudah selesai atau belum). */
function generateTodoObject(id, task, timestamp, isCompleted) {
    return {
        id,
        task,
        timestamp,
        isCompleted
    }
}

/*
 FUNCTION make, delete, restore
*/

function makeTodo(todoObject) {
    // berfungsi membuat objek html
    const textTitle = document.createElement('h2');
    textTitle.innerText = todoObject.task;

    const textTimestamp = document.createElement('p');
    textTimestamp.innerText = todoObject.timestamp;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textTimestamp);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `todo-${todoObject.id}`);

    

    if (todoObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function(){
            undoTaskFromCompleted(todoObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function(){
            removeTaskFromCompleted(todoObject.id);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function() {
            addTaskToCompleted(todoObject.id);
        });

        container.append(checkButton);
    }
    return container;
}

function addTaskToCompleted (todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

/*
findTodo, yang mana berfungsi untuk mencari todo dengan 
ID yang sesuai pada array todos.
*/
function findTodo(todoId) {
    for (const todoItem of todos) {
        if (todoItem.id === todoId) {
            return todoItem;
        }
    }
    return null;
}

// function remove dari done
function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);

    if (todoTarget === -1) return;

    todos.splice(todoTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// function undo 
function undoTaskFromCompleted(todoId) {
    const todoTarget = findTodo(todoId);

    if (todoTarget === null) return;

    todoTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findTodoIndex(todoId) {
    for (const index in todos) {
        if (todos[index].id === todoId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        // menggunakan json stringify untuk konversinya (dari objek ke string) spy bs disimpan
        const parsed = JSON.stringify(todos);
        // menyimpan ke storage sesuai key yg ditentukan
        localStorage.setItem(STORAGE_KEY, parsed);
        // membuat event baru untuk mempermudah debugging atau tracking perubahan data
        document.dispatchEvent(new Event(SAVED_EVENT)); // saved event adalah event baru yang dibuat
    }
}

const SAVED_EVENT = 'saved_todo';
const STORAGE_KEY = 'TODO_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert ('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

/**
 * agar dapat memudahkan dalam mengetahui bahwa pada setiap perubahan data bisa secara sukses memperbarui 
 * data pada storage, kita bisa menerapkan listener dari event SAVED_EVENT. Kemudian, di dalam event listener 
 * tersebut kita bisa memanggil getItem(KEY) untuk mengambil data dari localStorage, lalu bisa kita tampilkan 
 * secara sederhana menggunakan console log.
 **/
document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            todos.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}
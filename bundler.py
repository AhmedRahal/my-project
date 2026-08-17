import os
import sys
import ctypes
import subprocess
import threading
import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
from pathlib import Path

def is_admin():
    """Check if the script is running with administrator privileges."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

class FileProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("File Processor & Permissions Tool")
        self.root.geometry("780x750")
        
        # Modern styling
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Configure grid expansion
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

        self.create_widgets()

    def create_widgets(self):
        # Main Container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(0, weight=1)  # Notebook expands
        main_frame.rowconfigure(1, weight=1)  # Console expands

        # --- TAB NOTEBOOK ---
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.grid(row=0, column=0, sticky="nsew", pady=(0, 10))

        # Tab 1: Code Harvester (Get Files Content)
        self.tab_harvester = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.tab_harvester, text=" 📄 Harvester (Get File Content) ")
        
        # Tab 2: Permissions Fixer (Get Access)
        self.tab_permissions = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.tab_permissions, text=" 🔒 Permissions (Grant Full Access) ")

        self.build_harvester_tab()
        self.build_permissions_tab()

        # --- SECTION: Live Console ---
        console_frame = ttk.LabelFrame(main_frame, text=" Live Console ", padding="5")
        console_frame.grid(row=1, column=0, sticky="nsew")
        console_frame.columnconfigure(0, weight=1)
        console_frame.rowconfigure(0, weight=1)

        self.console = scrolledtext.ScrolledText(
            console_frame, wrap=tk.WORD, height=10, state='disabled', 
            bg="#1e1e1e", fg="#00ff00", font=("Consolas", 9)
        )
        self.console.grid(row=0, column=0, sticky="nsew")

        # --- SECTION: Status Bar ---
        self.status_var = tk.StringVar()
        self.status_var.set("Ready" if is_admin() else "Ready (Non-Admin Mode - Permissions features require Admin)")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor="w", padding="2")
        status_bar.grid(row=1, column=0, sticky="ew")

    # --- TAB 1: HARVESTER BUILDER ---
    def build_harvester_tab(self):
        self.tab_harvester.columnconfigure(0, weight=1)

        # Paths Frame
        path_frame = ttk.LabelFrame(self.tab_harvester, text=" Directories ", padding="10")
        path_frame.grid(row=0, column=0, sticky="ew", pady=(0, 10))
        path_frame.columnconfigure(1, weight=1)

        ttk.Label(path_frame, text="Target:").grid(row=0, column=0, sticky="w", pady=5)
        self.entry_dir = ttk.Entry(path_frame)
        self.entry_dir.insert(0, os.getcwd())
        self.entry_dir.grid(row=0, column=1, sticky="ew", padx=10, pady=5)
        ttk.Button(path_frame, text="Browse", command=self.browse_target).grid(row=0, column=2, pady=5)

        ttk.Label(path_frame, text="Output:").grid(row=1, column=0, sticky="w", pady=5)
        self.entry_out = ttk.Entry(path_frame)
        self.entry_out.insert(0, os.path.join(os.getcwd(), "output"))
        self.entry_out.grid(row=1, column=1, sticky="ew", padx=10, pady=5)
        ttk.Button(path_frame, text="Browse", command=self.browse_output).grid(row=1, column=2, pady=5)

        # Filters Frame
        filter_frame = ttk.LabelFrame(self.tab_harvester, text=" Filters & Settings ", padding="10")
        filter_frame.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        filter_frame.columnconfigure(1, weight=1)

        ttk.Label(filter_frame, text="Extensions:").grid(row=0, column=0, sticky="w", pady=5)
        self.entry_exts = ttk.Entry(filter_frame)
        self.entry_exts.insert(0, ".js .html .scss")
        self.entry_exts.grid(row=0, column=1, sticky="ew", padx=10, pady=5)

        ttk.Label(filter_frame, text="Ignore Dirs:").grid(row=1, column=0, sticky="w", pady=5)
        self.entry_ignore = ttk.Entry(filter_frame)
        self.entry_ignore.insert(0, "node_modules .vscode .git")
        self.entry_ignore.grid(row=1, column=1, sticky="ew", padx=10, pady=5)

        self.var_split = tk.BooleanVar()
        ttk.Checkbutton(filter_frame, text="Split output files by extension", variable=self.var_split).grid(row=2, column=1, sticky="w", padx=10, pady=5)

        # Exceptions Frame
        except_frame = ttk.LabelFrame(self.tab_harvester, text=" Specific File Exceptions ", padding="10")
        except_frame.grid(row=2, column=0, sticky="ew", pady=(0, 10))
        except_frame.columnconfigure(0, weight=1)

        list_container = ttk.Frame(except_frame)
        list_container.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        list_container.rowconfigure(0, weight=1)
        list_container.columnconfigure(0, weight=1)
        
        self.list_exceptions = tk.Listbox(list_container, height=3, selectmode=tk.EXTENDED)
        self.list_exceptions.grid(row=0, column=0, sticky="nsew")
        
        scrollbar = ttk.Scrollbar(list_container, orient="vertical", command=self.list_exceptions.yview)
        scrollbar.grid(row=0, column=1, sticky="ns")
        self.list_exceptions.configure(yscrollcommand=scrollbar.set)

        btn_container = ttk.Frame(except_frame)
        btn_container.grid(row=0, column=1, sticky="ns")
        
        ttk.Button(btn_container, text="Add File(s)", command=self.add_exception_files).grid(row=0, column=0, sticky="ew", pady=(0, 2))
        ttk.Button(btn_container, text="Remove Selected", command=self.remove_exception_file).grid(row=1, column=0, sticky="ew", pady=2)
        ttk.Button(btn_container, text="Clear All", command=self.clear_exception_files).grid(row=2, column=0, sticky="ew", pady=2)

        # Start Processing Button
        self.btn_run = ttk.Button(self.tab_harvester, text="Start Code Harvesting", command=self.start_process_thread)
        self.btn_run.grid(row=3, column=0, sticky="ew", ipady=5)

    # --- TAB 2: PERMISSIONS BUILDER ---
    def build_permissions_tab(self):
        self.tab_permissions.columnconfigure(0, weight=1)

        perm_frame = ttk.LabelFrame(self.tab_permissions, text=" Take Ownership & Grant Access (icacls) ", padding="15")
        perm_frame.grid(row=0, column=0, sticky="ew", pady=10)
        perm_frame.columnconfigure(1, weight=1)

        ttk.Label(perm_frame, text="Target Path:").grid(row=0, column=0, sticky="w", pady=10)
        self.entry_perm_target = ttk.Entry(perm_frame)
        self.entry_perm_target.grid(row=0, column=1, sticky="ew", padx=10, pady=10)
        
        btn_perm_browse = ttk.Frame(perm_frame)
        btn_perm_browse.grid(row=0, column=2)
        ttk.Button(btn_perm_browse, text="Select File", command=self.browse_perm_file).pack(side="left", padx=2)
        ttk.Button(btn_perm_browse, text="Select Folder", command=self.browse_perm_folder).pack(side="left")

        ttk.Label(perm_frame, text="User Account:").grid(row=1, column=0, sticky="w", pady=10)
        self.entry_perm_user = ttk.Entry(perm_frame)
        self.entry_perm_user.insert(0, r"AHMED\rahal")
        self.entry_perm_user.grid(row=1, column=1, sticky="ew", padx=10, pady=10)

        self.btn_fix_perm = ttk.Button(perm_frame, text="Grant Full Control Access", command=self.start_permissions_thread)
        self.btn_fix_perm.grid(row=2, column=0, columnspan=3, sticky="ew", pady=(15, 5), ipady=5)

    # --- UI Interactions ---
    def browse_target(self):
        folder = filedialog.askdirectory(initialdir=self.entry_dir.get())
        if folder:
            self.entry_dir.delete(0, tk.END)
            self.entry_dir.insert(0, folder)

    def browse_output(self):
        folder = filedialog.askdirectory(initialdir=self.entry_out.get())
        if folder:
            self.entry_out.delete(0, tk.END)
            self.entry_out.insert(0, folder)

    def browse_perm_file(self):
        file = filedialog.askopenfilename()
        if file:
            self.entry_perm_target.delete(0, tk.END)
            self.entry_perm_target.insert(0, file)

    def browse_perm_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.entry_perm_target.delete(0, tk.END)
            self.entry_perm_target.insert(0, folder)

    def add_exception_files(self):
        files = filedialog.askopenfilenames(title="Select files to exclude")
        existing_files = self.list_exceptions.get(0, tk.END)
        for f in files:
            if f not in existing_files:
                self.list_exceptions.insert(tk.END, f)

    def remove_exception_file(self):
        selected_indices = self.list_exceptions.curselection()
        for index in reversed(selected_indices):
            self.list_exceptions.delete(index)

    def clear_exception_files(self):
        self.list_exceptions.delete(0, tk.END)

    def log(self, message):
        self.console.config(state='normal')
        self.console.insert(tk.END, message + "\n")
        self.console.see(tk.END)
        self.console.config(state='disabled')

    # --- Permissions Logic ---
    def start_permissions_thread(self):
        target = self.entry_perm_target.get().strip()
        user = self.entry_perm_user.get().strip()

        if not target or not user:
            messagebox.showerror("Error", "Please select a target file/folder and specify a user account.")
            return

        self.btn_fix_perm.config(state="disabled")
        self.status_var.set("Fixing permissions...")
        
        thread = threading.Thread(target=self.run_permissions_commands, args=(target, user))
        thread.daemon = True
        thread.start()

    def run_permissions_commands(self, target_path, username):
        try:
            # 1. Convert path to absolute Windows format (fixing forward slashes and typos)
            clean_path = str(Path(target_path).resolve())
            
            if not os.path.exists(clean_path):
                self.log(f"\n[ERROR] Path does not exist on disk: {clean_path}")
                self.log("Check for typos in folder/file names.")
                self.status_var.set("File or directory not found.")
                return

            path_obj = Path(clean_path)
            is_dir = path_obj.is_dir()

            self.log(f"\n--- Granting Full Control ---")
            self.log(f"Normalized Path: {clean_path}")
            self.log(f"User: {username}")

            # 2. takeown
            if is_dir:
                takeown_cmd = f'takeown /F "{clean_path}" /R /A /D Y'
            else:
                takeown_cmd = f'takeown /F "{clean_path}" /A'

            self.log(f"Running: {takeown_cmd}")
            res1 = subprocess.run(takeown_cmd, capture_output=True, text=True, shell=True)
            if res1.stdout:
                self.log(res1.stdout.strip())
            if res1.stderr:
                self.log(f"Error output: {res1.stderr.strip()}")

            # 3. icacls
            if is_dir:
                icacls_cmd = f'icacls "{clean_path}" /grant {username}:(OI)(CI)F /T /C'
            else:
                icacls_cmd = f'icacls "{clean_path}" /grant {username}:F'

            self.log(f"Running: {icacls_cmd}")
            res2 = subprocess.run(icacls_cmd, capture_output=True, text=True, shell=True)
            if res2.stdout:
                self.log(res2.stdout.strip())
            if res2.stderr:
                self.log(f"Error output: {res2.stderr.strip()}")

            self.log("Permissions update finished.\n")
            self.status_var.set("Permissions updated successfully.")

        except Exception as e:
            self.log(f"Permissions error: {e}")
            self.status_var.set("Failed to set permissions.")
        finally:
            self.root.after(0, lambda: self.btn_fix_perm.config(state="normal"))

    # --- Code Harvester Processing Logic ---
    def start_process_thread(self):
        target = self.entry_dir.get()
        out_path = self.entry_out.get()

        if not target or not out_path:
            messagebox.showerror("Error", "Please select both target and output directories.")
            return

        self.btn_run.config(state="disabled")
        self.status_var.set("Processing files... Please wait.")
        self.console.config(state='normal')
        self.console.delete(1.0, tk.END)
        self.console.config(state='disabled')

        exts = [e.strip() if e.strip().startswith('.') else f'.{e.strip()}' for e in self.entry_exts.get().split()]
        ignored_dirs = set(self.entry_ignore.get().split())
        split = self.var_split.get()
        exception_files = {Path(p).resolve() for p in self.list_exceptions.get(0, tk.END)}

        thread = threading.Thread(target=self.process_files, args=(target, exts, ignored_dirs, exception_files, split, out_path))
        thread.daemon = True
        thread.start()

    def process_files(self, target_dir, extensions, ignored_dirs, exception_files, split_files, output_path):
        try:
            os.makedirs(output_path, exist_ok=True)
            reset_files = set()
            processed_count = 0

            self.log(f"Starting scan in: {target_dir}")
            self.log(f"Looking for: {', '.join(extensions)}")
            if exception_files:
                self.log(f"Ignoring {len(exception_files)} specific file(s).\n")
            else:
                self.log("\n")

            for root, dirs, files in os.walk(target_dir):
                dirs[:] = [d for d in dirs if d not in ignored_dirs]
                
                for file in files:
                    file_path = Path(root) / file
                    
                    try:
                        if file_path.resolve() in exception_files:
                            self.log(f"Skipped Exception File: {file}")
                            continue
                    except Exception:
                        pass

                    if any(file_path.suffix == ext for ext in extensions):
                        try:
                            content = file_path.read_text(encoding='utf-8')
                            
                            if split_files:
                                out_name = os.path.join(output_path, f"all_{file_path.suffix.lstrip('.')}.txt")
                            else:
                                out_name = os.path.join(output_path, "all_files.txt")

                            mode = 'w' if out_name not in reset_files else 'a'
                            
                            with open(out_name, mode, encoding='utf-8') as f:
                                f.write(f"\n===== {file_path} =====\n{content}\n")
                            
                            reset_files.add(out_name)
                            processed_count += 1
                            self.log(f"Merged: {file}")
                            
                        except Exception as e:
                            self.log(f"Skipped {file} (Error): {e}")

            self.log(f"\nDone! Successfully processed {processed_count} files.")
            self.status_var.set(f"Completed. {processed_count} files processed.")
            
        except Exception as e:
            self.log(f"\nFATAL ERROR: {e}")
            self.status_var.set("An error occurred.")
            
        finally:
            self.root.after(0, lambda: self.btn_run.config(state="normal"))

if __name__ == "__main__":
    # Auto-elevate to administrator if not already running as admin
    if not is_admin():
        try:
            ctypes.windll.shell32.ShellExecuteW(
                None, "runas", sys.executable, " ".join(f'"{arg}"' for arg in sys.argv), None, 1
            )
        except Exception as err:
            messagebox.showerror("Elevation Error", f"Failed to request Administrator privileges:\n{err}")
    else:
        root = tk.Tk()
        app = FileProcessorApp(root)
        root.mainloop()
import os
import fitz # PyMuPDF
import glob
import math

def split_large_pdfs(base_dir, max_size_mb=40, pages_per_split=30):
    print(f"Scanning {base_dir} for PDFs larger than {max_size_mb}MB...")
    
    large_pdfs = []
    for root, _, files in os.walk(base_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                file_path = os.path.join(root, file)
                size_mb = os.path.getsize(file_path) / (1024 * 1024)
                if size_mb > max_size_mb:
                    large_pdfs.append(file_path)

    if not large_pdfs:
        print("No large PDFs found! Everything is ready.")
        return

    print(f"Found {len(large_pdfs)} massive PDFs. Splitting them into {pages_per_split}-page chapters...")

    for pdf_path in large_pdfs:
        print(f"\nProcessing: {os.path.basename(pdf_path)}")
        try:
            doc = fitz.open(pdf_path)
            total_pages = len(doc)
            print(f"Total Pages: {total_pages}")
            
            num_splits = math.ceil(total_pages / pages_per_split)
            
            for i in range(num_splits):
                start_page = i * pages_per_split
                end_page = min(start_page + pages_per_split - 1, total_pages - 1)
                
                # Create a new document for this split
                split_doc = fitz.open()
                split_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
                
                # Create output filename
                base_name = os.path.splitext(os.path.basename(pdf_path))[0]
                output_name = f"{base_name}_chapter_{i+1}.pdf"
                output_path = os.path.join(os.path.dirname(pdf_path), output_name)
                
                split_doc.save(output_path)
                split_doc.close()
                print(f"  -> Saved {output_name}")
                
            doc.close()
            
            # Backup the original so the AI doesn't try to read the massive file again
            backup_path = pdf_path + ".backup"
            os.rename(pdf_path, backup_path)
            print(f"Backed up original file to {os.path.basename(backup_path)}")
            
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")

if __name__ == "__main__":
    split_large_pdfs(r"d:\AL\AL", max_size_mb=40, pages_per_split=30)

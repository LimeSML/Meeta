export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto w-full border-t border-gray-200 bg-gray-100 py-6">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-x-2">
          <span className="font-bold text-primary">Meeta</span>
          <p className="text-sm text-gray-500">
            © {currentYear} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

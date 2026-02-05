export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} Nuva. 版權所有
        </p>
      </div>
    </footer>
  )
}

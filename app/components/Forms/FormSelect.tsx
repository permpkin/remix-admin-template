export const FormSelect = ({ name, options, onChange }:any) => {
  return (
    <select onChange={onChange} className='block w-full rounded-md border-gray-300 py-1 pl-3 pr-10 text-xs focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'>
      <option value="">All</option>
      {
        options.map((value: string, index: number) => (
          <option key={`filter-${name}-${index}`} value={value}>{value}</option>
        ))
      }
    </select>
  )
}
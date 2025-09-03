import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface FileBreadcrumbProps {
  filePath: string
}

export const FileBreadcrumb = ({ filePath }: FileBreadcrumbProps) => {
  const pathSegment = filePath.split('/')
  const maxSegments = 4

  const renderBreadcrumbItems = () => {
    if (pathSegment.length <= maxSegments) {
      return pathSegment.map((segment, index) => {
        const isLast = index === pathSegment.length - 1
        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator />}
          </Fragment>
        )
      })
    } else {
      const firstSegment = pathSegment[0]
      const lastSegments = pathSegment[pathSegment.length - 1]
      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstSegment}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {lastSegments}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      )
    }
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  )
}
